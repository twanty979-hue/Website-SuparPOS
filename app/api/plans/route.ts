// app/api/plans/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseServer';
import { mergePlanContents, DEFAULT_PLAN_CONTENTS } from '@/lib/planContents';

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
    const authHeader = request.headers.get('authorization');
    if (!authHeader) throw new Error('Unauthorized');

    // ตรวจสอบ User ฝั่ง Client
    const supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    const { data: profile } = await supabaseClient.from('profiles').select('brand_id').eq('id', user.id).single();
    if (!profile?.brand_id) throw new Error('No brand assigned');

    const brandId = profile.brand_id;

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
        .order('price_monthly', { ascending: true }),
      supabaseAdmin
        .from('payment_logs')
        .select('id')
        .eq('brand_id', brandId)
        .eq('status', 'successful')
        .limit(1),
      supabaseAdmin
        .from('brands')
        .select('plan, expiry_basic, expiry_pro, expiry_ultimate')
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
    const currentPlan = brand?.plan || 'free';

    if (brand && currentPlan !== 'free') {
      let rawExpiry = null;

      // เลือกคอลัมน์วันหมดอายุให้ตรงตามแพลนปัจจุบันของร้านค้า
      if (currentPlan === 'basic') rawExpiry = brand.expiry_basic;
      else if (currentPlan === 'pro') rawExpiry = brand.expiry_pro;
      else if (currentPlan === 'ultimate') rawExpiry = brand.expiry_ultimate;

      if (rawExpiry) {
        expiryDate = rawExpiry;
        const expiry = new Date(rawExpiry);
        const now = new Date();
        
        // คำนวณส่วนต่างมิลลิวินาทีแปลงออกมาเป็นจำนวนวัน
        const diffTime = expiry.getTime() - now.getTime();
        daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }
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
