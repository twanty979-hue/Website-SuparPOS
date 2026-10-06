import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calculateEffectivePlan, getBrandPlanPermissions } from '@/lib/planPermissions'
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
    .select('id,full_name,email,phone,avatar_url,role,brand_id,invited_brand_id,is_joined,is_active,created_at,updated_at')
    .or(`brand_id.eq.${profile.brand_id},invited_brand_id.eq.${profile.brand_id}`)
    .neq('id', profile.id)

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })

  const { data: usersData } = await db.auth.admin.listUsers()
  const userMap = new Map((usersData?.users || []).map(u => [u.id, u]))

  const data = (members || []).map(member => {
    const authUser = userMap.get(member.id)
    // ✅ ลำดับ: auth email → profiles.email (fallback)
    const email = authUser?.email || (member.email as string | undefined) || ''
    const meta = authUser?.user_metadata || {}

    const defaultPerms = member.role === 'chef' ? DEFAULT_CHEF_PERMS : DEFAULT_CASHIER_PERMS
    const permissions = Array.isArray(meta.permissions) ? meta.permissions : defaultPerms

    const isActive = member.is_active !== false
    const hasStoreAccess = member.brand_id === profile.brand_id && isActive
    const status = !isActive ? 'inactive' : (hasStoreAccess ? 'active' : 'pending')
    const hasAuth = !!authUser

    return {
      ...member,
      name: member.full_name || meta.full_name || 'พนักงาน',
      email: email || (isActive ? '' : '(ถอดสิทธิ์แล้ว • คืนอีเมลว่าง)'),
      role: member.role || meta.role || 'cashier',
      permissions,
      avatar_url: member.avatar_url || meta.avatar_url || null,
      is_active: isActive,
      has_auth: hasAuth,
      has_store_access: hasStoreAccess,
      status,
      created_at: member.created_at || null,
      updated_at: member.updated_at || null,
      detached_at: !isActive ? (member.updated_at || null) : null,
    }
  })

  // 🌟 พนักงานที่ใช้งานอยู่ขึ้นก่อน ตามด้วยอดีตพนักงาน
  data.sort((a, b) => (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0))

  // 🛡️ ดึงโควตาพนักงานตามแพลนที่ตั้งไว้จากฐานข้อมูลแบบไดนามิก
  let quota: {
    plan: string
    current_staff: number
    max_staff: number
    is_unlimited: boolean
    remaining: number
    can_add_more: boolean
    expiry_date: string | null
  } = {
    plan: 'free',
    current_staff: 0,
    max_staff: 0,
    is_unlimited: false,
    remaining: 0,
    can_add_more: false,
    expiry_date: null,
  }

  try {
    const { data: brand } = await db
      .from('brands')
      .select('plan, expiry_go, expiry_basic, expiry_pro, expiry_ultimate')
      .eq('id', profile.brand_id)
      .maybeSingle()

    const { plan: effectivePlan, limits } = await getBrandPlanPermissions(db, profile.brand_id)
    const maxStaff = typeof limits.max_staff === 'number'
      ? limits.max_staff
      : (effectivePlan === 'pro' ? 3 : 0)
    const isUnlimited = effectivePlan === 'ultimate' || (maxStaff === 0 && effectivePlan !== 'free' && effectivePlan !== 'go' && effectivePlan !== 'basic')
    const activeStaffCount = data.filter(m => m.is_active).length

    // ดึงวันหมดอายุของแพลนที่ใช้งานอยู่
    const expiryKey = `expiry_${effectivePlan}` as keyof typeof brand
    const expiryDate = brand ? (brand[expiryKey] as string | null) : null

    quota = {
      plan: effectivePlan,
      current_staff: activeStaffCount,
      max_staff: maxStaff,
      is_unlimited: isUnlimited,
      remaining: isUnlimited ? -1 : Math.max(0, maxStaff - activeStaffCount),
      can_add_more: isUnlimited || activeStaffCount < maxStaff,
      expiry_date: expiryDate ?? null,
    }
  } catch (_) {}

  return NextResponse.json({ success: true, data, quota })
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

  // ==================== REACTIVATE / ACTIVATE STAFF ====================
  if (action === 'reactivate' || action === 'activate') {
    const targetId = String(body.id || body.employeeId || '').trim()
    if (!targetId) return NextResponse.json({ success: false, error: 'ระบุรหัสพนักงาน' }, { status: 400 })

    const { data: targetProfile } = await db
      .from('profiles')
      .select('id,brand_id,role,is_active,full_name')
      .eq('id', targetId)
      .maybeSingle()

    if (!targetProfile || targetProfile.brand_id !== profile.brand_id) {
      return NextResponse.json({ success: false, error: 'ไม่พบพนักงานในร้านนี้' }, { status: 404 })
    }

    // ตรวจสอบโควตาพนักงานก่อนเปิดใช้งาน
    const { plan: effectivePlan, limits } = await getBrandPlanPermissions(db, profile.brand_id)
    const maxStaff = typeof limits.max_staff === 'number'
      ? limits.max_staff
      : (effectivePlan === 'pro' ? 3 : (effectivePlan === 'ultimate' ? 0 : 0))
    const isUnlimited = effectivePlan === 'ultimate' || (maxStaff === 0 && effectivePlan === 'pro')

    if (!isUnlimited) {
      const { count: activeStaffCount } = await db
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('brand_id', profile.brand_id)
        .neq('role', 'owner')
        .neq('is_active', false)

      if ((activeStaffCount || 0) >= maxStaff) {
        return NextResponse.json({
          success: false,
          error: `โควตาพนักงานเต็มแล้ว (${activeStaffCount}/${maxStaff} คน) กรุณาอัปเกรดเป็น Ultimate หรือถอดพนักงานคนอื่นออกก่อน`,
        }, { status: 400 })
      }
    }

    // ตรวจสอบว่ายังมีบัญชี Auth หรือไม่ (กรณีถอดสิทธิ์แบบลบ Auth เพื่อปลดปล่อยอีเมล)
    const { data: authUserData, error: authCheckErr } = await db.auth.admin.getUserById(targetId)
    if (authCheckErr || !authUserData?.user) {
      return NextResponse.json({
        success: false,
        error: `บัญชีพนักงานนี้ถูกถอดออกจากระบบและปลดปล่อยชื่อผู้ใช้/อีเมลไปแล้ว หากต้องการให้พนักงานกลับมาทำงาน กรุณากด "+ เพิ่มพนักงาน" เพื่อสร้างบัญชีใหม่ได้เลยครับ`,
      }, { status: 400 })
    }

    // ปลดแบนใน Auth
    try {
      await db.auth.admin.updateUserById(targetId, {
        ban_duration: 'none',
        user_metadata: { is_active: true },
      })
    } catch (_) {}

    await db.from('profiles').update({
      is_active: true,
      is_joined: true,
      updated_at: new Date().toISOString(),
    }).eq('id', targetId)

    return NextResponse.json({
      success: true,
      message: `เปิดใช้งานบัญชี ${targetProfile.full_name || 'พนักงาน'} เรียบร้อยแล้ว`,
    })
  }

  // ==================== CREATE STAFF (@posfoodscan.com) ====================
  // ตรวจสอบแพ็กเกจของร้านและโควตาพนักงานแบบไดนามิกจากฐานข้อมูล
  const { data: brandData } = await db
    .from('brands')
    .select('id,name')
    .eq('id', profile.brand_id)
    .maybeSingle()

  const { plan: effectivePlan, limits } = await getBrandPlanPermissions(db, profile.brand_id)
  const maxStaff = typeof limits.max_staff === 'number'
    ? limits.max_staff
    : (effectivePlan === 'pro' ? 3 : (effectivePlan === 'ultimate' ? 0 : 0))
  const isUnlimited = effectivePlan === 'ultimate' || (maxStaff === 0 && effectivePlan === 'pro')

  if (!isUnlimited && maxStaff <= 0) {
    return NextResponse.json({
      success: false,
      error: `แพ็กเกจ ${effectivePlan.toUpperCase()} ไม่รองรับการเพิ่มพนักงาน กรุณาอัปเกรดเป็น Pro หรือ Ultimate`,
    }, { status: 403 })
  }

  if (!isUnlimited) {
    const { count: activeStaffCount } = await db
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', profile.brand_id)
      .neq('role', 'owner')
      .neq('is_active', false)

    if ((activeStaffCount || 0) >= maxStaff) {
      return NextResponse.json({
        success: false,
        error: `แพ็กเกจ ${effectivePlan.toUpperCase()} สามารถเพิ่มพนักงานที่ใช้งานอยู่ได้สูงสุด ${maxStaff} คน (ขณะนี้มี ${activeStaffCount} คน) หากต้องการเพิ่มมากกว่านี้ กรุณาอัปเกรดเป็น Ultimate หรือถอดพนักงานที่ไม่ใช้ออกครับ`,
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
  // mode: 'deactivate' (default, ถอดพนักงานออกอย่างปลอดภัย ไม่ลบประวัติการขาย) หรือ 'permanent_delete' (ลบถาวรเฉพาะเมื่อไม่มีบิลขาย)
  const mode = String(body.mode || 'deactivate').toLowerCase()

  if (!employeeId) {
    return NextResponse.json({ success: false, error: 'ระบุรหัสพนักงานที่ต้องการลบหรือถอดสิทธิ์' }, { status: 400 })
  }

  const { data: target } = await db
    .from('profiles')
    .select('id,brand_id,email,full_name')
    .eq('id', employeeId)
    .maybeSingle()

  if (!target || target.brand_id !== profile.brand_id) {
    return NextResponse.json({ success: false, error: 'ไม่พบพนักงานในร้านนี้' }, { status: 404 })
  }

  // 🛡️ ตรวจสอบว่าพนักงานมีประวัติการขายหรือสร้างบิลใน pai_orders หรือไม่
  const { count: salesHistoryCount } = await db
    .from('pai_orders')
    .select('id', { count: 'exact', head: true })
    .eq('cashier_id', employeeId)

  const hasSalesHistory = (salesHistoryCount || 0) > 0

  if (mode === 'permanent_delete') {
    if (hasSalesHistory) {
      return NextResponse.json({
        success: false,
        error: `พนักงานท่านนี้ (${target.full_name || target.email}) มีประวัติบิลขายในระบบจำนวน ${salesHistoryCount} บิล เพื่อความถูกต้องของรายงานยอดขายและใบเสร็จย้อนหลัง กรุณาใช้การ 'ถอดออกจากร้าน (ระงับสิทธิ์)' แทนการลบถาวรครับ`,
      }, { status: 400 })
    }

    // ไม่มีประวัติการขาย สามารถลบถาวรได้
    await db.from('profiles').delete().eq('id', employeeId)
    try {
      await db.auth.admin.deleteUser(employeeId)
    } catch (_) {}
    try {
      await db.from('invitation_logs').delete().eq('employee_id', employeeId)
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: 'ลบบัญชีพนักงานถาวรเรียบร้อยแล้ว',
      action: 'deleted',
    })
  }

  // 🛡️ DEFAULT MODE: 'deactivate' (ถอดพนักงานออกอย่างปลอดภัย คืนโควตา ลบ Auth เพื่อคืนเมลให้ว่าง แต่เก็บโปรไฟล์และยอดขายไว้ 100%)
  // 1. ลบบัญชีออกจาก Supabase Auth เพื่อปลดปล่อยอีเมล/Username ให้คนใหม่นำไปใช้ต่อได้ทันที
  try {
    await db.auth.admin.deleteUser(employeeId)
  } catch (authDelErr) {
    console.warn('[Staff DELETE] Auth deleteUser warning:', authDelErr)
  }

  // 2. ปรับสถานะใน profiles เป็นไม่ใช้งาน และเคลียร์ email = null เพื่อปลดล็อก Unique Constraint (profiles_email_key)
  // คงค่า id, full_name, role, brand_id ไว้ครบถ้วนเพื่อคงประวัติบิลใน pai_orders
  await db.from('profiles').update({
    is_active: false,
    is_joined: false,
    email: null,
    updated_at: new Date().toISOString(),
  }).eq('id', employeeId)

  // 3. เคลียร์ประวัติคำเชิญ (ถ้ามี)
  try {
    await db.from('invitation_logs').delete().eq('employee_id', employeeId)
  } catch (_) {}

  return NextResponse.json({
    success: true,
    message: `ถอดพนักงานออกจากร้านเรียบร้อยแล้ว คืนโควตาและปลดปล่อยชื่อผู้ใช้ให้คนใหม่นำไปใช้ได้ทันที (ประวัติการขายและบิลของ ${target.full_name || 'พนักงาน'} ยังคงอยู่ครบถ้วน 100%)`,
    action: 'deactivated',
  })
}
