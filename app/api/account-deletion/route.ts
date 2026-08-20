import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

async function authenticatedUser(request: NextRequest) {
  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ')) return null
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: authorization } },
      auth: { autoRefreshToken: false, persistSession: false },
    },
  )
  const { data: { user } } = await client.auth.getUser()
  return user
}

export async function POST(request: NextRequest) {
  const user = await authenticatedUser(request)
  if (!user?.email) {
    return NextResponse.json(
      { success: false, error: 'กรุณาเข้าสู่ระบบก่อนส่งคำขอลบบัญชี' },
      { status: 401 },
    )
  }

  const body = await request.json().catch(() => ({}))
  const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 1000) : null
  const db = admin()
  const { data: profile, error: profileError } = await db
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()
  if (profileError) return NextResponse.json({ success: false, error: profileError.message }, { status: 500 })

  const { error } = await db.from('account_deletion_requests').upsert(
    {
      user_id: user.id,
      email: user.email,
      full_name: profile?.full_name || null,
      reason,
      status: 'pending',
      requested_at: new Date().toISOString(),
      processed_at: null,
      processed_by: null,
    },
    { onConflict: 'user_id' },
  )
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  return NextResponse.json({
    success: true,
    message: 'เราได้รับคำขอลบบัญชีแล้ว ทีมงานจะตรวจสอบและดำเนินการภายใน 30 วัน',
  })
}
