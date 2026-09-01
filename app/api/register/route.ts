// app/api/register/route.ts
import { NextResponse } from 'next/server';
import { authRedirectTargets } from '../_authRedirect';
import { getSupabaseAnon } from '@/lib/supabaseServer';

// ✅ 1. รองรับ OPTIONS สำหรับ Android/Flutter
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
    const supabaseAdmin = getSupabaseAnon();
    const { email, password, source } = await request.json();
    const { callbackOrigin, returnTo } = authRedirectTargets(request, source);
    const callbackUrl = new URL('/auth/callback', callbackOrigin);
    callbackUrl.searchParams.set('source', source === 'app' ? 'app' : 'web');
    if (returnTo) callbackUrl.searchParams.set('return_to', returnTo);
    callbackUrl.searchParams.set(
      'next',
      source === 'app' ? '/login?verified=1' : '/setup',
    );
    // Email verification is completed on the trusted web callback. The app
    // never receives Supabase codes or project keys directly.
    const emailRedirectTo = callbackUrl.toString();

    // 2. สั่งสมัครสมาชิกผ่าน Supabase
    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        // กำหนดให้หลังจากยืนยันอีเมลแล้ว วิ่งกลับมาที่หน้านี้
        emailRedirectTo,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // ✅ 3. เตรียมข้อมูลส่งกลับ
    // กรณีที่ Supabase ตั้งค่าให้ต้องยืนยันอีเมล data.session จะเป็น null
    const responseData = {
      success: true,
      user: data.user,
      session: data.session, // จะมีค่าก็ต่อเมื่อปิดการยืนยันอีเมลใน Supabase
      message: data.session ? "สมัครสมาชิกสำเร็จ" : "โปรดเช็คอีเมลเพื่อยืนยันตัวตน",
    };

    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
