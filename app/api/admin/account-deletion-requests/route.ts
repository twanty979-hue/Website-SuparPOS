import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

async function authenticatedAdmin(request: NextRequest) {
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
  if (!user?.email) return null

  const allowedEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
  if (!allowedEmails.includes(user.email.toLowerCase())) return null
  return user
}

const unauthorized = () => NextResponse.json(
  { success: false, error: 'ไม่มีสิทธิ์เข้าดูคำขอลบบัญชี กรุณาเข้าสู่ระบบด้วยอีเมลผู้ดูแล' },
  { status: 403 },
)

export async function GET(request: NextRequest) {
  const user = await authenticatedAdmin(request)
  if (!user) return unauthorized()

  const { data, error } = await admin()
    .from('account_deletion_requests')
    .select('id,email,full_name,reason,status,requested_at,processed_at,processed_by')
    .order('requested_at', { ascending: false })
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, requests: data || [] })
}

export async function PATCH(request: NextRequest) {
  const user = await authenticatedAdmin(request)
  if (!user) return unauthorized()

  const body = await request.json().catch(() => ({}))
  const id = typeof body.id === 'string' ? body.id : ''
  const status = typeof body.status === 'string' ? body.status : ''
  if (!id || !['pending', 'processing', 'completed', 'rejected'].includes(status)) {
    return NextResponse.json({ success: false, error: 'ข้อมูลสถานะไม่ถูกต้อง' }, { status: 400 })
  }

  const completed = status === 'completed' || status === 'rejected'
  const { data, error } = await admin()
    .from('account_deletion_requests')
    .update({
      status,
      processed_at: completed ? new Date().toISOString() : null,
      processed_by: completed ? user.id : null,
    })
    .eq('id', id)
    .select('id,email,full_name,reason,status,requested_at,processed_at,processed_by')
    .single()
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, request: data })
}
