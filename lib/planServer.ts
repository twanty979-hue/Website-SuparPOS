import 'server-only';
import { getSupabaseAdmin } from '@/lib/supabaseServer';
import { mergePlanContents, DEFAULT_PUBLIC_PLANS, type PublicPlanItem } from '@/lib/planContents';
import type { PlanOfferItem } from '@/lib/seo';

export async function getPublicPricingPlans(): Promise<{
  plans: PublicPlanItem[];
  seoOffers: PlanOfferItem[];
}> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const [
      { data: dbPlans, error: dbPlansError },
      { data: planContentsRows, error: contentsError },
    ] = await Promise.all([
      supabaseAdmin
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true }),
      supabaseAdmin
        .from('plan_contents')
        .select('*'),
    ]);

    if (dbPlansError) {
      console.warn('Could not query subscription_plans, fallback to defaults:', dbPlansError.message);
    }
    if (contentsError) {
      console.warn('Could not query plan_contents, fallback to defaults:', contentsError.message);
    }

    const planContents = mergePlanContents(planContentsRows);

    // ซ่อน Ultimate Plan ชั่วคราว (ฟีเจอร์ยังไม่พร้อมขาย) แสดงเฉพาะ free, basic, pro
    const planKeys: ('free' | 'basic' | 'pro')[] = ['free', 'basic', 'pro'];

    const plans: PublicPlanItem[] = planKeys.map((key) => {
      const dbPlan = (dbPlans || []).find((p: any) => p.plan_key === key || p.plan_type === key);
      const content = planContents[key];
      // ฐานราคามาตรฐาน (ราคาในแอป / ฐานราคาปกติก่อนลด)
      const baseMonthly = key === 'free'
        ? 0
        : (dbPlan ? Number(dbPlan.price_monthly || 0) / 100 : (key === 'basic' ? 250 : key === 'pro' ? 500 : 1999));
      const originalMonthly = baseMonthly;
      const originalYearly = baseMonthly * 12;

      // ราคาพิเศษเฉพาะบนเว็บ: ซื้อผ่านเว็บลด 15% รายเดือน
      const priceMonthly = key === 'free'
        ? 0
        : Math.round(originalMonthly * 0.85 * 10) / 10;

      // ราคาพิเศษเฉพาะบนเว็บ: สมัครรายปีลด 25%
      const priceYearly = key === 'free'
        ? 0
        : Math.round(originalYearly * 0.75);

      const coinsMonthly = dbPlan ? Number(dbPlan.coins_monthly || 0) : 0;
      const coinsYearly = dbPlan ? Number(dbPlan.coins_yearly || 0) : 0;

      return {
        id: dbPlan?.id || key,
        plan_key: key,
        name: content?.name || (key === 'free' ? 'Free Plan' : key === 'basic' ? 'Basic Plan' : key === 'pro' ? 'Pro Plan' : 'Ultimate Plan'),
        subtitle: content?.subtitle || '',
        badge: content?.badge || (key === 'free' ? 'ฟรี' : key === 'basic' ? 'เบสิก' : key === 'pro' ? 'ยอดนิยม' : 'คุ้มค่าที่สุด'),
        price_monthly: priceMonthly,
        original_price_monthly: originalMonthly,
        price_yearly: priceYearly,
        original_price_yearly: originalYearly,
        coins_monthly: coinsMonthly,
        coins_yearly: coinsYearly,
        metric_1_label: content?.metric_1_label || '',
        metric_1_value: content?.metric_1_value || '',
        metric_2_label: content?.metric_2_label || '',
        metric_2_value: content?.metric_2_value || '',
        features: content?.features || [],
        isPopular: key === 'pro',
      };
    });

    const seoOffers: PlanOfferItem[] = plans.map((p) => ({
      name: `${p.name} (${p.badge})`,
      price: p.price_monthly,
      priceCurrency: 'THB',
      description: `${p.subtitle ? p.subtitle + ' - ' : ''}${p.features.join(', ')}`,
      billingDuration: p.plan_key === 'free' ? 'LIFETIME' : 'MONTH',
      url: 'https://suparpos.com/pricing',
    }));

    return { plans, seoOffers };
  } catch (error) {
    console.error('Error in getPublicPricingPlans, using defaults:', error);
    return {
      plans: DEFAULT_PUBLIC_PLANS,
      seoOffers: DEFAULT_PUBLIC_PLANS.map((p) => ({
        name: `${p.name} (${p.badge})`,
        price: p.price_monthly,
        priceCurrency: 'THB',
        description: `${p.subtitle ? p.subtitle + ' - ' : ''}${p.features.join(', ')}`,
        billingDuration: p.plan_key === 'free' ? 'LIFETIME' : 'MONTH',
        url: 'https://suparpos.com/pricing',
      })),
    };
  }
}
