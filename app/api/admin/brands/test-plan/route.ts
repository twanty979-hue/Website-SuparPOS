import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseServer';
import dayjs from 'dayjs';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { brandId, plan, durationMinutes = 5 } = body;

    if (!brandId) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุ brandId ของร้านค้า' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const normalizedPlan = String(plan || 'free').toLowerCase();
    const validPlans = ['free', 'go', 'basic', 'pro', 'ultimate'];
    if (!validPlans.includes(normalizedPlan)) {
      return NextResponse.json(
        { success: false, error: `แพลนไม่ถูกต้อง (ต้องเป็น: ${validPlans.join(', ')})` },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

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
    const minutes = Number(durationMinutes) > 0 ? Number(durationMinutes) : 5;
    const expiryTimestamp = now.add(minutes, 'minute').toISOString();

    // 2. ล้างวันหมดอายุของแพลนเดิมทั้งหมดออก แล้วตั้งค่าแพลนใหม่ที่มีอายุตามที่กำหนด (5 นาที)
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

    console.log(
      `🧪 [Admin Test Plan] ร้าน "${brand.name}" (${brandId}) ถูกเปลี่ยนเป็นแพลน "${normalizedPlan.toUpperCase()}" โดยมีอายุ ${minutes} นาที (หมดอายุ: ${normalizedPlan === 'free' ? 'ไม่มี' : expiryTimestamp})`
    );

    const message =
      normalizedPlan === 'free'
        ? `รีเซ็ตแพลนของร้าน "${brand.name}" กลับเป็น Free เรียบร้อยแล้ว (ล้างแพลนเก่าทั้งหมด)`
        : `เปลี่ยนร้าน "${brand.name}" เป็นแพลน ${normalizedPlan.toUpperCase()} เรียบร้อยแล้ว! (มีอายุทดสอบ ${minutes} นาที)`;

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
