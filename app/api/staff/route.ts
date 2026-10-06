import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calculateEffectivePlan } from '@/lib/planPermissions'
import { getAuthenticatedUser } from '@/lib/authHelper'

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const STAFF_DOMAIN = '@posfoodscan.com'

const DEFAULT_CASHIER_PERMS = ['pos', 'kitchen', 'receipt_history', 'table']
const DEFAULT_CHEF_PERMS = ['kitchen', 'inventory', 'menu']
const ALL_PERMS = ['pos', 'kitchen', 'receipt_history', 'dashboard', 'inventory', 'menu', 'main_product', 'table', 'discount', 'banner', 'theme', 'settings']

async function ownerContext(request: NextRequest) {
  const { user, adminClient: db } = await getAuthenticatedUser(request)
  if (!user) return null
  const { data: profile } = await db.from('profiles').select('id,brand_id,role').eq('id', user.id).maybeSingle()
  if (!profile?.brand_id || profile.role !== 'owner') return null
  return { user, profile, db }
}

const denied = () => NextResponse.json({ success: false, error: 'เฉพาะเจ้าของร้านเท่านั้น' }, { status: 403 })

export async function GET(request: NextRequest) {
  const context = await ownerContext(request)
  if (!context) return denied()
  const { db, profile } = context

  const { data: members, error } = await db
    .from('profiles')
    .select('id,full_name,phone,avatar_url,role,brand_id,invited_brand_id,is_joined')
    .or(`brand_id.eq.${profile.brand_id},invited_brand_id.eq.${profile.brand_id}`)
    .neq('id', profile.id)

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })

  const { data: usersData } = await db.auth.admin.listUsers()
  const userMap = new Map((usersData?.users || []).map(u => [u.id, u]))

  const data = (members || []).map(member => {
    const authUser = userMap.get(member.id)
    const email = authUser?.email || ''
    const meta = authUser?.user_metadata || {}

    const defaultPerms = member.role === 'chef' ? DEFAULT_CHEF_PERMS : DEFAULT_CASHIER_PERMS
    const permissions = Array.isArray(meta.permissions) ? meta.permissions : defaultPerms

    const hasStoreAccess = member.brand_id === profile.brand_id

    return {
      ...member,
      name: member.full_name || meta.full_name || 'พนักงาน',
      email,
      role: member.role || meta.role || 'cashier',
      permissions,
      avatar_url: member.avatar_url || meta.avatar_url || null,
      has_store_access: hasStoreAccess,
      status: hasStoreAccess ? 'active' : 'pending',
    }
  })

  return NextResponse.json({ success: true, data })
}

export async function POST(request: NextRequest) {
  const context = await ownerContext(request)
  if (!context) return denied()
  const { db, profile } = context
  const body = await request.json().catch(() => ({}))
  const action = body.action || 'create'

  // ==================== UPDATE PERMISSIONS & ROLE ====================
  if (action === 'update' || action === 'update_permissions') {
    const targetId = String(body.id || body.employeeId || '').trim()
    if (!targetId) return NextResponse.json({ success: false, error: 'ระบุรหัสพนักงาน' }, { status: 400 })

    const { data: targetProfile } = await db
      .from('profiles')
      .select('id,brand_id,role')
      .eq('id', targetId)
      .maybeSingle()

    if (!targetProfile || targetProfile.brand_id !== profile.brand_id) {
      return NextResponse.json({ success: false, error: 'ไม่พบพนักงานในร้านนี้' }, { status: 404 })
    }

    const updatedRole = body.role === 'chef' ? 'chef' : 'cashier'
    const updatedFullName = body.full_name ? String(body.full_name).trim() : undefined
    const updatedAvatarUrl = body.avatar_url !== undefined
      ? (body.avatar_url ? String(body.avatar_url).trim() : null)
      : undefined
    const updatedPermissions = Array.isArray(body.permissions)
      ? body.permissions
      : (updatedRole === 'chef' ? DEFAULT_CHEF_PERMS : DEFAULT_CASHIER_PERMS)

    const authUpdates: { user_metadata: Record<string, any>; password?: string } = {
      user_metadata: {
        role: updatedRole,
        permissions: updatedPermissions,
        ...(updatedFullName ? { full_name: updatedFullName } : {}),
        ...(updatedAvatarUrl !== undefined ? { avatar_url: updatedAvatarUrl } : {}),
      },
    }

    if (body.password && String(body.password).trim().length >= 6) {
      authUpdates.password = String(body.password).trim()
    }

    await db.auth.admin.updateUserById(targetId, authUpdates)

    await db.from('profiles').update({
      role: updatedRole,
      ...(updatedFullName ? { full_name: updatedFullName } : {}),
      ...(updatedAvatarUrl !== undefined ? { avatar_url: updatedAvatarUrl } : {}),
      updated_at: new Date().toISOString(),
    }).eq('id', targetId)

    return NextResponse.json({
      success: true,
      message: 'อัปเดตข้อมูลและสิทธิ์พนักงานเรียบร้อยแล้ว',
      role: updatedRole,
      permissions: updatedPermissions,
      ...(updatedAvatarUrl !== undefined ? { avatar_url: updatedAvatarUrl } : {}),
    })
  }

  // ==================== CREATE STAFF (@posfoodscan.com) ====================
  // ตรวจสอบแพ็กเกจของร้าน
  const { data: brandData } = await db
    .from('brands')
    .select('id,name,plan,expiry_go,expiry_basic,expiry_pro,expiry_ultimate')
    .eq('id', profile.brand_id)
    .maybeSingle()

  const effectivePlan = calculateEffectivePlan(brandData)
  if (effectivePlan !== 'pro' && effectivePlan !== 'ultimate') {
    return NextResponse.json({
      success: false,
      error: 'แพ็กเกจของคุณไม่รองรับการเพิ่มพนักงาน กรุณาอัปเกรดเป็น Pro หรือ Ultimate',
    }, { status: 403 })
  }

  if (effectivePlan === 'pro') {
    const { count: currentStaffCount } = await db
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', profile.brand_id)
      .neq('role', 'owner')

    if ((currentStaffCount || 0) >= 3) {
      return NextResponse.json({
        success: false,
        error: 'แพ็กเกจ Pro สามารถเพิ่มพนักงานได้สูงสุด 3 คน (ไม่รวมเจ้าของร้าน) หากต้องการเพิ่มมากกว่านี้ กรุณาอัปเกรดเป็น Ultimate',
      }, { status: 400 })
    }
  }

  const rawUsername = String(body.username || body.email || '').trim().toLowerCase()
  const password = String(body.password || '').trim()
  const fullName = String(body.full_name || body.name || '').trim()
  const role = body.role === 'chef' ? 'chef' : 'cashier'
  const avatarUrl = body.avatar_url ? String(body.avatar_url).trim() : null

  if (!rawUsername) {
    return NextResponse.json({ success: false, error: 'กรุณากรอกชื่อผู้ใช้ (Username)' }, { status: 400 })
  }

  if (!password || password.length < 6) {
    return NextResponse.json({ success: false, error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' }, { status: 400 })
  }

  if (!fullName) {
    return NextResponse.json({ success: false, error: 'กรุณากรอกชื่อพนักงาน' }, { status: 400 })
  }

  // จัดรูปแบบอีเมลภายใต้ @posfoodscan.com
  let email = rawUsername
  if (!email.includes('@')) {
    email = `${email}${STAFF_DOMAIN}`
  } else if (!email.endsWith(STAFF_DOMAIN)) {
    // ถ้าระบุ @ อื่นมา ให้เปลี่ยนเป็นโดเมนของร้าน
    const userPart = email.split('@')[0]
    email = `${userPart}${STAFF_DOMAIN}`
  }

  // กำหนดสิทธิ์ตั้งต้นถ้าไม่ได้ส่งมา
  const permissions = Array.isArray(body.permissions) && body.permissions.length > 0
    ? body.permissions
    : (role === 'chef' ? DEFAULT_CHEF_PERMS : DEFAULT_CASHIER_PERMS)

  // ตรวจสอบว่าชื่อผู้ใช้ซ้ำใน Auth หรือไม่
  const { data: existingUsers } = await db.auth.admin.listUsers()
  const duplicate = (existingUsers?.users || []).find(u => u.email?.toLowerCase() === email)
  if (duplicate) {
    const usernameOnly = email.replace(STAFF_DOMAIN, '')
    return NextResponse.json({
      success: false,
      error: `ชื่อผู้ใช้ "${usernameOnly}" มีในระบบแล้ว กรุณาตั้งชื่ออื่น เช่น ${usernameOnly}01`,
    }, { status: 400 })
  }

  // เสกบัญชี Auth ใหม่โดยยืนยันอีเมลทันที
  const { data: newAuthUser, error: authError } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role,
      permissions,
      brand_id: profile.brand_id,
      created_by_owner_id: profile.id,
      avatar_url: avatarUrl,
    },
  })

  if (authError || !newAuthUser?.user) {
    return NextResponse.json({
      success: false,
      error: authError?.message || 'ไม่สามารถสร้างบัญชีได้',
    }, { status: 400 })
  }

  // บันทึกลงตาราง profiles ให้พร้อมใช้งานทันที (is_joined = true)
  const { error: profileUpsertError } = await db.from('profiles').upsert({
    id: newAuthUser.user.id,
    brand_id: profile.brand_id,
    full_name: fullName,
    email,
    role,
    avatar_url: avatarUrl,
    is_joined: true,
    is_active: true,
    updated_at: new Date().toISOString(),
  })

  if (profileUpsertError) {
    // Rollback auth user ถ้า profiles insert ไม่สำเร็จ
    await db.auth.admin.deleteUser(newAuthUser.user.id).catch(() => {})
    return NextResponse.json({
      success: false,
      error: profileUpsertError.message,
    }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    message: 'สร้างบัญชีพนักงานเรียบร้อยแล้ว',
    staff: {
      id: newAuthUser.user.id,
      full_name: fullName,
      email,
      role,
      permissions,
      avatar_url: avatarUrl,
      brand_id: profile.brand_id,
      brand_name: brandData?.name || '',
    },
  })
}

export async function DELETE(request: NextRequest) {
  const context = await ownerContext(request)
  if (!context) return denied()
  const { db, profile } = context
  const body = await request.json().catch(() => ({}))
  const employeeId = String(body.employeeId || body.id || '')

  if (!employeeId) {
    return NextResponse.json({ success: false, error: 'ระบุรหัสพนักงานที่ต้องการลบ' }, { status: 400 })
  }

  const { data: target } = await db
    .from('profiles')
    .select('id,brand_id,email')
    .eq('id', employeeId)
    .maybeSingle()

  if (!target || target.brand_id !== profile.brand_id) {
    return NextResponse.json({ success: false, error: 'ไม่พบพนักงานในร้านนี้' }, { status: 404 })
  }

  // ลบออกจาก profiles
  await db.from('profiles').delete().eq('id', employeeId)

  // ลบบัญชี auth ด้วย
  try {
    await db.auth.admin.deleteUser(employeeId)
  } catch (_) {}

  // ลบ log คำเชิญเก่าถ้ามี
  try {
    await db.from('invitation_logs').delete().eq('employee_id', employeeId)
  } catch (_) {}

  return NextResponse.json({ success: true, message: 'ลบบัญชีพนักงานเรียบร้อยแล้ว' })
}
