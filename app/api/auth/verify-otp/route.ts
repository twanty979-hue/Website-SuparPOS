import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'node:crypto'

function recoveryTicket(userId: string) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) throw new Error('Missing recovery signing secret')
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      purpose: 'password_recovery',
      exp: Math.floor(Date.now() / 1000) + 10 * 60,
    })
  ).toString('base64url')
  const signature = createHmac('sha256', secret).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

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
    const { email, token, type } = await request.json()
    if (!email || !token) {
      return NextResponse.json(
        { error: 'กรุณากรอกอีเมลและรหัส OTP 6 หลัก' },
        { status: 400, headers }
      )
    }

    const supabase = createClient(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const otpType = type === 'recovery' ? 'recovery' : 'signup'
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: token.toString().trim(),
      type: otpType as any,
    })

    if (error) {
      return NextResponse.json(
        { error: 'รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว' },
        { status: 400, headers }
      )
    }

    let ticket: string | null = null
    if (otpType === 'recovery' && data.user) {
      ticket = recoveryTicket(data.user.id)
    }

    return NextResponse.json(
      {
        success: true,
        session: data.session,
        user: data.user,
        ticket,
        message: otpType === 'recovery' ? 'ยืนยัน OTP สำเร็จ กรุณาตั้งรหัสผ่านใหม่' : 'ยืนยันอีเมลสำเร็จ',
      },
      { status: 200, headers }
    )
  } catch (err: any) {
    console.error('Verify OTP Error:', err)
    return NextResponse.json(
      { error: err.message || 'เกิดข้อผิดพลาดในการตรวจสอบ OTP' },
      { status: 500, headers }
    )
  }
}
