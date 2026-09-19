import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseServer';
import { getAuthenticatedUser } from '@/lib/authHelper';

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
    const supabaseAdmin = getSupabaseAdmin();
    // 🛡️ ขั้นตอนที่ 1 & 2: ตรวจสอบและดึง User จาก Token (รองรับ Expired Token อัตโนมัติ)
    const { user } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "เซสชันหมดอายุหรือสิทธิ์ไม่ถูกต้อง" }, 
        { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const secureUserId = user.id;
    const { shopName, shopPhone } = await request.json();

    if (!shopName) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ครบถ้วน" }, 
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 🛑 ขั้นตอนที่ 3: เช็คเงื่อนไขล็อกสิทธิ์ (1 คน ต่อ 1 ร้านเท่านั้น)
    let { data: currentProfile, error: profileReadError } = await supabaseAdmin
      .from('profiles')
      .select('brand_id')
      .eq('id', secureUserId)
      .maybeSingle();

    if (profileReadError) throw profileReadError;
    if (!currentProfile) {
      const metadata = user.user_metadata || {};
      const { data: createdProfile, error: createProfileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: secureUserId,
          full_name: String(metadata.full_name || metadata.name || user.email || '').trim() || null,
          avatar_url: String(metadata.avatar_url || metadata.picture || '').trim() || null,
          updated_at: new Date().toISOString(),
        })
        .select('brand_id')
        .single();
      if (createProfileError) throw createProfileError;
      currentProfile = createdProfile;
    }

    if (currentProfile?.brand_id) {
      return NextResponse.json(
        { success: true, brandId: currentProfile.brand_id, alreadyExists: true },
        { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 🚀 ขั้นตอนที่ 4: เริ่มทำธุรกรรมเมื่อผ่านการตรวจสอบทั้งหมด

    // สร้าง Brand ใหม่
    const { data: brand, error: brandErr } = await supabaseAdmin.from('brands').insert({
      name: shopName,
      phone: shopPhone,
      plan: 'free',
      status: 'trial',
      // Keep tutorial completion state on the brand so every device for this
      // shop sees the same onboarding progress from its first sign-in.
      config: {
        vat: 0,
        onboarding_completed: false,
        service_charge: 0,
        tutorial_pos: false,
        tutorial_menu: false,
        tutorial_theme: false,
        tutorial_progress: {
          pos: false,
          menu: false,
          theme: false,
        },
      },
    }).select().single();

    if (brandErr) throw brandErr;

    // อัปเดต Profile ให้ผูกกับ Brand นี้
    const { error: profileErr } = await supabaseAdmin.from('profiles').update({
      brand_id: brand.id,
      own_brand_id: brand.id,
      role: 'owner',
      updated_at: new Date().toISOString()
    }).eq('id', secureUserId).select('id').single(); // อัปเดตตรงไอดีที่ได้มาจาก Token

    if (profileErr) {
      await supabaseAdmin.from('brands').delete().eq('id', brand.id);
      throw profileErr;
    }

    const response = NextResponse.json({ 
      success: true, 
      brandId: brand.id,
      message: "สร้างร้านค้าและตั้งค่าเจ้าของสำเร็จ" 
    });
    
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดภายในระบบ" }, 
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
