import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseServer';
import dayjs from 'dayjs';

export const dynamic = 'force-dynamic';

export const DEFAULT_TEST_BRAND_ID = '9fd8c2f8-cc19-4869-8ea0-f1df2e314a13';

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

// 🌟 ดึงข้อมูล Subscriber จาก RevenueCat API
async function fetchRevenueCatSubscriber(brandId: string) {
  const secretKey = process.env.REVENUECAT_SECRET_KEY?.trim();
  if (!secretKey) {
    return {
      status: 'no_key',
      message: 'ไม่ได้ตั้งค่า REVENUECAT_SECRET_KEY ในระบบ',
      entitlements: [],
      subscriptions: [],
      activeEntitlementsCount: 0,
    };
  }

  try {
    const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(brandId)}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (res.status === 404) {
      return {
        status: 'not_found',
        message: 'ไม่พบประวัติ Subscriber ใน RevenueCat (ไม่มีข้อมูลค้าง สะอาดพร้อมเทส)',
        entitlements: [],
        subscriptions: [],
        activeEntitlementsCount: 0,
      };
    }

    if (!res.ok) {
      const errText = await res.text();
      return {
        status: 'error',
        message: `RevenueCat API แจ้งเตือน (${res.status}): ${errText}`,
        entitlements: [],
        subscriptions: [],
        activeEntitlementsCount: 0,
      };
    }

    const data = await res.json();
    const subscriber = data?.subscriber;
    const entitlementsObj = subscriber?.entitlements || {};
    const subscriptionsObj = subscriber?.subscriptions || {};

    const now = dayjs();
    const entitlements = Object.entries(entitlementsObj).map(([key, val]: [string, any]) => {
      const expiresDate = val.expires_date ? dayjs(val.expires_date) : null;
      const isActive = expiresDate ? expiresDate.isAfter(now) : false;
      return {
        key,
        isActive,
        expiresDate: val.expires_date,
        purchaseDate: val.purchase_date,
        productId: val.product_identifier,
      };
    });

    const subscriptions = Object.entries(subscriptionsObj).map(([productId, val]: [string, any]) => {
      const expiresDate = val.expires_date ? dayjs(val.expires_date) : null;
      const isActive = expiresDate ? expiresDate.isAfter(now) : false;
      return {
        productId,
        isActive,
        expiresDate: val.expires_date,
        purchaseDate: val.purchase_date,
        store: val.store,
        periodType: val.period_type,
      };
    });

    const activeCount = entitlements.filter((e) => e.isActive).length;

    return {
      status: 'found',
      message: activeCount > 0
        ? `พบข้อมูลใน RevenueCat (มี ${activeCount} รายการที่กำลัง Active)`
        : 'พบประวัติใน RevenueCat (แต่หมดอายุแล้วทั้งหมด)',
      entitlements,
      subscriptions,
      activeEntitlementsCount: activeCount,
      lastSeen: subscriber?.last_seen,
    };
  } catch (err: any) {
    return {
      status: 'error',
      message: `เกิดข้อผิดพลาดในการเชื่อมต่อ RevenueCat: ${err.message}`,
      entitlements: [],
      subscriptions: [],
      activeEntitlementsCount: 0,
    };
  }
}

// 🌟 ลบข้อมูล Subscriber ออกจาก RevenueCat API
async function deleteRevenueCatSubscriber(brandId: string) {
  const secretKey = process.env.REVENUECAT_SECRET_KEY?.trim();
  if (!secretKey) {
    return { success: false, error: 'ไม่ได้ตั้งค่า REVENUECAT_SECRET_KEY ในระบบ' };
  }

  try {
    const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(brandId)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.status === 200 || res.status === 204 || res.status === 404) {
      return { success: true, status: res.status };
    }

    const errText = await res.text();
    return { success: false, error: `RevenueCat delete error (${res.status}): ${errText}` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId') || DEFAULT_TEST_BRAND_ID;

    const supabase = getSupabaseAdmin();
    const { data: brand, error } = await supabase
      .from('brands')
      .select('id, name, slug, plan, logo_url, expiry_go, expiry_basic, expiry_pro, expiry_ultimate, updated_at')
      .eq('id', brandId)
      .maybeSingle();

    if (error || !brand) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลร้านค้านี้ในระบบ' },
        { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const now = dayjs();
    let effectivePlan = 'free';
    let activeExpiry: string | null = null;

    if (brand.expiry_ultimate && dayjs(brand.expiry_ultimate).isAfter(now)) {
      effectivePlan = 'ultimate';
      activeExpiry = brand.expiry_ultimate;
    } else if (brand.expiry_pro && dayjs(brand.expiry_pro).isAfter(now)) {
      effectivePlan = 'pro';
      activeExpiry = brand.expiry_pro;
    } else if (brand.expiry_basic && dayjs(brand.expiry_basic).isAfter(now)) {
      effectivePlan = 'basic';
      activeExpiry = brand.expiry_basic;
    } else if (brand.expiry_go && dayjs(brand.expiry_go).isAfter(now)) {
      effectivePlan = 'go';
      activeExpiry = brand.expiry_go;
    }

    // Remaining seconds
    let remainingSeconds = 0;
    if (activeExpiry) {
      const diffMs = dayjs(activeExpiry).diff(now);
      remainingSeconds = Math.max(0, Math.floor(diffMs / 1000));
    }

    // Fetch RevenueCat status simultaneously
    const rcStatus = await fetchRevenueCatSubscriber(brandId);

    return NextResponse.json(
      {
        success: true,
        brand: {
          ...brand,
          effectivePlan,
          activeExpiry,
          remainingSeconds,
        },
        revenueCat: rcStatus,
      },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const brandId = body.brandId || DEFAULT_TEST_BRAND_ID;
    const action = body.action || (body.plan ? 'switch_plan' : 'reset_all');
    const { plan, durationMinutes = 5 } = body;

    const supabase = getSupabaseAdmin();

    // 1. ตรวจสอบว่าร้านค้ามีอยู่จริง
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('id, name, plan, expiry_go, expiry_basic, expiry_pro, expiry_ultimate')
      .eq('id', brandId)
      .maybeSingle();

    if (brandError || !brand) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลร้านค้านี้ในระบบ' },
        { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const now = dayjs();

    // 🧹 ACTION 1: ล้างทั้ง RevenueCat และ Cloud (All-in-One Reset)
    if (action === 'reset_all' || action === 'purge_all') {
      const rcResult = await deleteRevenueCatSubscriber(brandId);
      
      const { error: dbError } = await supabase
        .from('brands')
        .update({
          plan: 'free',
          expiry_go: null,
          expiry_basic: null,
          expiry_pro: null,
          expiry_ultimate: null,
          updated_at: now.toISOString(),
        })
        .eq('id', brandId);

      if (dbError) {
        return NextResponse.json(
          { success: false, error: `รีเซ็ตใน Database ไม่สำเร็จ: ${dbError.message}` },
          { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: `🧹 ล้างข้อมูลร้าน "${brand.name}" ทั้งใน RevenueCat และ Cloud สำเร็จเรียบร้อย! (สถานะกลับเป็น Free พร้อมเทสซื้อใหม่)`,
          action: 'reset_all',
          rcDeleted: rcResult.success,
          rcError: rcResult.error,
        },
        { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 🧹 ACTION 2: ล้างเฉพาะ RevenueCat
    if (action === 'reset_revenuecat') {
      const rcResult = await deleteRevenueCatSubscriber(brandId);
      if (!rcResult.success) {
        return NextResponse.json(
          { success: false, error: `ลบใน RevenueCat ไม่สำเร็จ: ${rcResult.error}` },
          { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: `ลบ Subscriber ร้าน "${brand.name}" ออกจาก RevenueCat สำเร็จเรียบร้อย!`,
          action: 'reset_revenuecat',
        },
        { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 🧹 ACTION 3: ล้างเฉพาะ Cloud (Database)
    if (action === 'reset_cloud') {
      const { error: dbError } = await supabase
        .from('brands')
        .update({
          plan: 'free',
          expiry_go: null,
          expiry_basic: null,
          expiry_pro: null,
          expiry_ultimate: null,
          updated_at: now.toISOString(),
        })
        .eq('id', brandId);

      if (dbError) {
        return NextResponse.json(
          { success: false, error: `รีเซ็ตใน Database ไม่สำเร็จ: ${dbError.message}` },
          { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: `รีเซ็ตสถานะร้าน "${brand.name}" ใน Cloud เป็น Free เรียบร้อยแล้ว!`,
          action: 'reset_cloud',
        },
        { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 🎛️ ACTION 4: จำลองเปลี่ยนแพลน (Simulator)
    const normalizedPlan = String(plan || 'free').toLowerCase();
    const validPlans = ['free', 'go', 'basic', 'pro', 'ultimate'];
    if (!validPlans.includes(normalizedPlan)) {
      return NextResponse.json(
        { success: false, error: `แพลนไม่ถูกต้อง (ต้องเป็น: ${validPlans.join(', ')})` },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const minutes = Number(durationMinutes) > 0 ? Number(durationMinutes) : 5;
    const expiryTimestamp = now.add(minutes, 'minute').toISOString();

    const updateData: Record<string, any> = {
      plan: normalizedPlan,
      expiry_go: normalizedPlan === 'go' ? expiryTimestamp : null,
      expiry_basic: normalizedPlan === 'basic' ? expiryTimestamp : null,
      expiry_pro: normalizedPlan === 'pro' ? expiryTimestamp : null,
      expiry_ultimate: normalizedPlan === 'ultimate' ? expiryTimestamp : null,
      updated_at: now.toISOString(),
    };

    const { error: updateError } = await supabase
      .from('brands')
      .update(updateData)
      .eq('id', brandId);

    if (updateError) {
      console.error('❌ [Admin Test Plan Error]:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const durationText = minutes >= 60 ? `${minutes / 60} ชม.` : `${minutes} นาที`;
    const message =
      normalizedPlan === 'free'
        ? `รีเซ็ตแพลนของร้าน "${brand.name}" กลับเป็น Free เรียบร้อยแล้ว (ล้างแพลนเก่าทั้งหมด)`
        : `เปลี่ยนร้าน "${brand.name}" เป็นแพลน ${normalizedPlan.toUpperCase()} เรียบร้อยแล้ว! (มีอายุทดสอบ ${durationText})`;

    return NextResponse.json(
      {
        success: true,
        message,
        data: {
          brandId,
          brandName: brand.name,
          plan: normalizedPlan,
          expiresAt: normalizedPlan === 'free' ? null : expiryTimestamp,
          durationMinutes: minutes,
        },
      },
      { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error: any) {
    console.error('❌ [Admin Test Plan Unexpected Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
