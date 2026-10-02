// app/api/plans/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseServer';
import { mergePlanContents, DEFAULT_PLAN_CONTENTS } from '@/lib/planContents';
import { getAuthContext } from '@/lib/authHelper';
import dayjs from 'dayjs';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
    ]);

    if (planError) throw planError;
    if (paymentError) throw paymentError;
    if (brandError) throw brandError;

    const planContents = mergePlanContents(planContentsRows);

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
