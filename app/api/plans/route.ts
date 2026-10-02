// app/api/plans/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseServer';
import { mergePlanContents, DEFAULT_PLAN_CONTENTS } from '@/lib/planContents';
import { getAuthContext } from '@/lib/authHelper';
import dayjs from 'dayjs';

const DEFAULT_DASHBOARD_PERMISSIONS = {
  free: { max_days: 30, allow_advanced: false, receipt_max_days: 7, max_food_items: 50, max_products: 0, max_tables: 10, max_orders: 300 },
  go: { max_days: 180, allow_advanced: false, receipt_max_days: 30, max_food_items: 0, max_products: 0, max_tables: 0, max_orders: 1000 },
  basic: { max_days: 0, allow_advanced: false, receipt_max_days: 0, max_food_items: 0, max_products: 0, max_tables: 0, max_orders: 0 },
  pro: { max_days: 0, allow_advanced: true, receipt_max_days: 0, max_food_items: 0, max_products: 0, max_tables: 0, max_orders: 0 },
  ultimate: { max_days: 0, allow_advanced: true, receipt_max_days: 0, max_food_items: 0, max_products: 0, max_tables: 0, max_orders: 0 }
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { brandId } = await getAuthContext(request);

    // ข้อมูลทั้งหมดไม่ขึ้นต่อกัน จึงดึงพร้อมกันเพื่อลดเวลา response
    const [
      { data: plans, error: planError },
      { data: successfulPayments, error: paymentError },
      { data: brand, error: brandError },
      { data: planContentsRows },
      { data: sysSettings },
    ] = await Promise.all([
      supabaseAdmin
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .neq('plan_key', 'ultimate')
        .order('price_monthly', { ascending: true }),
      supabaseAdmin
        .from('payment_logs')
        .select('id')
        .eq('brand_id', brandId)
        .eq('status', 'successful')
        .limit(1),
      supabaseAdmin
        .from('brands')
        .select('plan, expiry_go, expiry_basic, expiry_pro, expiry_ultimate')
        .eq('id', brandId)
        .single(),
      supabaseAdmin
        .from('plan_contents')
        .select('*'),
      supabaseAdmin
        .from('system_settings')
        .select('dashboard_permissions')
        .eq('id', 'global')
        .maybeSingle(),
    ]);

    if (planError) throw planError;
    if (paymentError) throw paymentError;
    if (brandError) throw brandError;

    const planContents = mergePlanContents(planContentsRows);
    const dashboardPermissions = {
      ...DEFAULT_DASHBOARD_PERMISSIONS,
      ...(sysSettings?.dashboard_permissions || {}),
    };

    const plansWithContent = (plans || []).map((p: any) => {
      const content = planContents[p.plan_key as keyof typeof planContents];
      return {
        ...p,
        name: content?.name || p.name,
        subtitle: content?.subtitle || '',
        badge: content?.badge || '',
        features: content?.features || [],
        metric_1_label: content?.metric_1_label || '',
        metric_1_value: content?.metric_1_value || '',
        metric_2_label: content?.metric_2_label || '',
        metric_2_value: content?.metric_2_value || '',
      };
    });

    const hasFreeInDb = plansWithContent.some((p: any) => (p.plan_key || '').toLowerCase() === 'free');
    if (!hasFreeInDb) {
      const freeContent = planContents.free || DEFAULT_PLAN_CONTENTS.free;
      plansWithContent.unshift({
        id: 'free',
        plan_key: 'free',
        name: freeContent.name,
        subtitle: freeContent.subtitle,
        badge: freeContent.badge,
        price_monthly: 0,
        price_yearly: 0,
        coins_monthly: 0,
        coins_yearly: 0,
        features: freeContent.features,
        metric_1_label: freeContent.metric_1_label,
        metric_1_value: freeContent.metric_1_value,
        metric_2_label: freeContent.metric_2_label,
        metric_2_value: freeContent.metric_2_value,
        is_active: true,
      });
    }

    const isFirstTimeBuyer = !successfulPayments?.length;

    let daysLeft = 0;
    let expiryDate: string | null = null;
    
    // 🌟 คำนวณ Effective Plan แบบเรียลไทม์ตามวันหมดอายุ
    const now = dayjs();
    let effectivePlan = 'free';
    if (brand?.expiry_ultimate && dayjs(brand.expiry_ultimate).isAfter(now)) {
      effectivePlan = 'ultimate';
      expiryDate = brand.expiry_ultimate;
    } else if (brand?.expiry_pro && dayjs(brand.expiry_pro).isAfter(now)) {
      effectivePlan = 'pro';
      expiryDate = brand.expiry_pro;
    } else if (brand?.expiry_basic && dayjs(brand.expiry_basic).isAfter(now)) {
      effectivePlan = 'basic';
      expiryDate = brand.expiry_basic;
    } else if (brand?.expiry_go && dayjs(brand.expiry_go).isAfter(now)) {
      effectivePlan = 'go';
      expiryDate = brand.expiry_go;
    }

    if (brand && brand.plan !== effectivePlan) {
      await supabaseAdmin.from('brands').update({ plan: effectivePlan }).eq('id', brandId);
      brand.plan = effectivePlan;
    }

    const currentPlan = effectivePlan;

    if (expiryDate) {
      const diffMs = dayjs(expiryDate).diff(now);
      daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    // 🚀 ส่งข้อมูลแพลนปัจจุบัน วันหมดอายุ และจำนวนวันคงเหลือกลับไปพร้อมกันทีเดียว
    return new NextResponse(JSON.stringify({ 
        success: true, 
        plans: plansWithContent, 
        planContents,
        dashboardPermissions,
        isFirstTimeBuyer,
        currentPlan,
        expiryDate,
        daysLeft
    }), {
      status: 200, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}

function calculateEffectivePlanForBrand(brand: any): string {
  const now = dayjs();
  if (brand?.expiry_ultimate && dayjs(brand.expiry_ultimate).isAfter(now)) return 'ultimate';
  if (brand?.expiry_pro && dayjs(brand.expiry_pro).isAfter(now)) return 'pro';
  if (brand?.expiry_basic && dayjs(brand.expiry_basic).isAfter(now)) return 'basic';
  if (brand?.expiry_go && dayjs(brand.expiry_go).isAfter(now)) return 'go';
  return 'free';
}

function expiryColumnForTier(plan: string): string {
  if (plan === 'go') return 'expiry_go';
  if (plan === 'basic') return 'expiry_basic';
  if (plan === 'pro') return 'expiry_pro';
  return 'expiry_ultimate';
}

export async function POST(request: Request) {
  try {
    const { brandId } = await getAuthContext(request);
    if (!brandId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan, period = 'monthly', expirationDate, action } = body;

    const normalizedPlan = String(plan || '').toLowerCase();

    const supabaseAdmin = getSupabaseAdmin();

    if (action === 'cancel' || normalizedPlan === 'free') {
      await supabaseAdmin
        .from('brands')
        .update({
          plan: 'free',
          expiry_go: null,
          expiry_basic: null,
          expiry_pro: null,
          expiry_ultimate: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', brandId);

      return NextResponse.json({
        success: true,
        currentPlan: 'free',
        expiryDate: null,
        daysLeft: 0,
      }, {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (!['go', 'basic', 'pro', 'ultimate'].includes(normalizedPlan)) {
      return NextResponse.json({ success: false, error: 'Invalid plan' }, { status: 400 });
    }
    const { data: brand, error: brandError } = await supabaseAdmin
      .from('brands')
      .select('*')
      .eq('id', brandId)
      .maybeSingle();

    if (brandError || !brand) {
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 });
    }

    const expiryCol = expiryColumnForTier(normalizedPlan);
    const now = dayjs();
    const currentExpiry = brand[expiryCol] ? dayjs(brand[expiryCol]) : null;

    let targetExpiry: string;
    if (expirationDate && dayjs(expirationDate).isValid()) {
      const appleExpiry = dayjs(expirationDate);
      if (appleExpiry.isAfter(now)) {
        targetExpiry = appleExpiry.toISOString();
      } else {
        return NextResponse.json({
          success: false,
          error: 'แพ็กเกจนี้หมดอายุแล้ว ไม่สามารถกู้คืนได้',
          expired: true,
        }, { status: 400 });
      }
    } else {
      targetExpiry = currentExpiry && currentExpiry.isAfter(now)
        ? currentExpiry.add(1, period === 'yearly' ? 'year' : 'month').toISOString()
        : now.add(1, period === 'yearly' ? 'year' : 'month').toISOString();
    }

    await supabaseAdmin
      .from('brands')
      .update({
        [expiryCol]: targetExpiry,
        updated_at: now.toISOString(),
      })
      .eq('id', brandId);

    const { data: updatedBrand } = await supabaseAdmin
      .from('brands')
      .select('*')
      .eq('id', brandId)
      .single();

    const effectivePlan = calculateEffectivePlanForBrand(updatedBrand);

    await supabaseAdmin
      .from('brands')
      .update({ plan: effectivePlan })
      .eq('id', brandId);

    // Update pending payment logs for this plan
    await supabaseAdmin
      .from('payment_logs')
      .update({ status: 'successful' })
      .eq('brand_id', brandId)
      .eq('plan_detail', normalizedPlan)
      .eq('status', 'pending');

    return NextResponse.json({
      success: true,
      currentPlan: effectivePlan,
      expiryDate: targetExpiry,
    }, {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error: any) {
    console.error('Sync plan error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

