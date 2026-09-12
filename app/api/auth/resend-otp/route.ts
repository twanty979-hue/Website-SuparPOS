import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function POST(request: Request) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  }

  try {
    const { email, type } = await request.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'กรุณาระบุอีเมล' },
        { status: 400, headers }
      )
    }

    const supabase = createClient(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    if (type === 'recovery') {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim())
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400, headers })
      }
    } else {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      })
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400, headers })
      }
    }

    return NextResponse.json(
      { success: true, message: 'ส่งรหัสยืนยัน OTP ใหม่ไปที่อีเมลแล้ว' },
      { status: 200, headers }
    )
  } catch (err: any) {
    console.error('Resend OTP Error:', err)
    return NextResponse.json(
      { error: err.message || 'เกิดข้อผิดพลาดในการส่ง OTP' },
      { status: 500, headers }
    )
  }
}
