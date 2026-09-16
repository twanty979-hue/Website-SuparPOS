import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { exceedsLimit, getBrandPlanPermissions } from '@/lib/planPermissions'

const admin = () =>
  createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

const generateRandomToken = () => Math.random().toString(36).substring(2, 10)

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
  try {
    const authorization = request.headers.get('authorization')
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : null
    if (!token) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบใหม่' }, { status: 401 })
    }

    const db = admin()
    const {
      data: { user },
      error: authError,
    } = await db.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' }, { status: 401 })
    }

    const body = await request.json()
    const {
      brandId,
      timezone = 'Asia/Bangkok',
      selectedProducts = [],
      selectedBannerUrl,
      tableCount = 10,
    } = body

    if (!brandId) {
      return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน (ไม่พบรหัสร้าน)' }, { status: 400 })
    }

    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('brand_id')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError || profile?.brand_id !== brandId) {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์ตั้งค่าร้านนี้' }, { status: 403 })
    }

<<<<<<< HEAD
    const { plan, limits } = await getBrandPlanPermissions(db, brandId)
    const responseLimits = {
      max_food_items: limits.max_food_items,
      max_products: limits.max_products,
      max_tables: limits.max_tables,
    }
    const finalTableCount = Math.max(1, Math.min(Number(tableCount) || 10, 100))
    const selectedProductList = Array.isArray(selectedProducts) ? selectedProducts : []

    if (exceedsLimit(finalTableCount, limits.max_tables)) {
      return NextResponse.json({
        error: `แพ็กเกจ ${plan.toUpperCase()} สร้างได้สูงสุด ${limits.max_tables} โต๊ะ`,
        code: 'TABLE_LIMIT_EXCEEDED',
        plan,
        limits: responseLimits,
      }, { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } })
    }
    if (exceedsLimit(selectedProductList.length, limits.max_food_items)) {
      return NextResponse.json({
        error: `แพ็กเกจ ${plan.toUpperCase()} เลือกอาหารได้สูงสุด ${limits.max_food_items} รายการ`,
        code: 'FOOD_LIMIT_EXCEEDED',
        plan,
        limits: responseLimits,
      }, { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } })
    }

    // เก็บ config เดิมไว้ และค่อยทำเครื่องหมายสำเร็จหลังสร้างข้อมูลครบทุกส่วน
=======
    // 🛡️ โหลดโควตาแพ็กเกจ Free จาก system_settings
    const { data: sysSettings } = await db
      .from('system_settings')
      .select('dashboard_permissions')
      .eq('id', 'global')
      .maybeSingle()

    const freePerms = sysSettings?.dashboard_permissions?.free || {}
    const maxAllowedFood = Number(freePerms.max_food_items ?? freePerms.max_products ?? 50)
    const maxAllowedTables = Number(freePerms.max_tables ?? 10)

    // 1. อัปเดต Timezone และบันทึกสถานะ Onboarding เสร็จสิ้น
>>>>>>> 6c994807b40fda37d6f01fc0d6f258b5c4415505
    const { data: currentBrand } = await db
      .from('brands')
      .select('config')
      .eq('id', brandId)
      .maybeSingle()
    const updatedConfig = {
      ...((currentBrand?.config as Record<string, any>) || {}),
      onboarding_completed: true,
    }

<<<<<<< HEAD
    // 2. สร้างโต๊ะตามจำนวนที่กำหนด (ถ้ายังไม่มีโต๊ะ)
    const { count: currentTableCount, error: tableCountError } = await db
=======
    // 2. สร้างโต๊ะตามจำนวนที่กำหนด (จำกัดไม่เกินโควตาของแผน)
    const { count: currentTableCount } = await db
>>>>>>> 6c994807b40fda37d6f01fc0d6f258b5c4415505
      .from('tables')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', brandId)
    if (tableCountError) throw tableCountError

    const { count: currentProductCount, error: productCountError } = await db
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', brandId)
    if (productCountError) throw productCountError
    if (
      (!currentProductCount || currentProductCount === 0) &&
      exceedsLimit(selectedProductList.length, limits.max_food_items)
    ) {
      return NextResponse.json({
        error: `จำนวนอาหารรวมเกินลิมิตแพ็กเกจ ${limits.max_food_items} รายการ`,
        code: 'FOOD_LIMIT_EXCEEDED',
        plan,
        limits: responseLimits,
      }, { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } })
    }

<<<<<<< HEAD
=======
    const requestedTableCount = Number(tableCount) || 10
    const finalTableCount = Math.max(
      1,
      maxAllowedTables > 0 ? Math.min(requestedTableCount, maxAllowedTables) : Math.min(requestedTableCount, 100)
    )
>>>>>>> 6c994807b40fda37d6f01fc0d6f258b5c4415505
    if (!currentTableCount || currentTableCount === 0) {
      const tables = Array.from({ length: finalTableCount }, (_, index) => ({
        brand_id: brandId,
        label: `T-${index + 1}`,
        capacity: 4,
        status: 'available',
        access_token: generateRandomToken(),
      }))
      const { error: tableError } = await db.from('tables').insert(tables)
      if (tableError) throw tableError
    }

    // 3. สร้างแบนเนอร์ร้าน
    const bannerUrl =
      selectedBannerUrl && selectedBannerUrl.trim().length > 0
        ? selectedBannerUrl.trim()
        : 'https://img.pos-foodscan.com/268dccbf-a568-4a90-b184-d23811937d9f/1772290694984-1772290692774.webp'

    const { count: bannerCount, error: bannerCountError } = await db
      .from('banners')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', brandId)
    if (bannerCountError) throw bannerCountError

    if (!bannerCount || bannerCount === 0) {
      const { error: bannerError } = await db.from('banners').insert({
        brand_id: brandId,
        image_name: bannerUrl,
        title: 'Welcome',
        sort_order: 1,
      })
      if (bannerError) throw bannerError
    }

    // 4. สร้างหมวดหมู่และสินค้าเฉพาะที่เลือก (จำกัดสูงสุดตามโควตาของแผน ไม่ให้ Error)
    const clampedProducts = Array.isArray(selectedProducts)
      ? (maxAllowedFood > 0 ? selectedProducts.slice(0, maxAllowedFood) : selectedProducts)
      : []

    let insertedProductsCount = 0
<<<<<<< HEAD
    if ((!currentProductCount || currentProductCount === 0) && selectedProductList.length > 0) {
      // รวมหมวดหมู่ที่ไม่ซ้ำกัน
      const categoryNames = Array.from(
        new Set(
          selectedProductList
=======
    if (clampedProducts.length > 0) {
      // รวมหมวดหมู่ที่ไม่ซ้ำกัน
      const categoryNames = Array.from(
        new Set(
          clampedProducts
>>>>>>> 6c994807b40fda37d6f01fc0d6f258b5c4415505
            .map((p: any) => p.category_name?.trim())
            .filter((name: string) => name && name.length > 0)
        )
      )

      const categoryMap: Record<string, string> = {}
      for (const catName of categoryNames) {
        // เช็คว่ามีหมวดหมู่นี้ในร้านแล้วหรือไม่
        const { data: existingCat, error: existingCatError } = await db
          .from('categories')
          .select('id')
          .eq('brand_id', brandId)
          .eq('name', catName)
          .maybeSingle()
        if (existingCatError) throw existingCatError

        if (existingCat) {
          categoryMap[catName as string] = existingCat.id
        } else {
          const { data: createdCat, error: catError } = await db
            .from('categories')
            .insert({ brand_id: brandId, name: catName, is_active: true })
            .select('id')
            .single()
          if (catError) throw catError
          categoryMap[catName as string] = createdCat.id
        }
      }

      // แปลงข้อมูลสินค้าเพื่อบันทึกลงตาราง products
<<<<<<< HEAD
      const productsToInsert = selectedProductList.map((p: any, index: number) => ({
=======
      const productsToInsert = clampedProducts.map((p: any, index: number) => ({
>>>>>>> 6c994807b40fda37d6f01fc0d6f258b5c4415505
        brand_id: brandId,
        name: p.name?.trim() || `สินค้า ${index + 1}`,
        image_name: p.image_url || null,
        price: Number(p.price) || 0,
        category_id: p.category_name ? categoryMap[p.category_name] || null : null,
        is_available: true,
        is_recommended: Boolean(p.is_recommended ?? (index < 4)),
      }))

      const { data: insertedProducts, error: prodError } = await db
        .from('products')
        .insert(productsToInsert)
        .select('id')

      if (prodError) {
        throw prodError
      } else if (insertedProducts) {
        insertedProductsCount = insertedProducts.length
      }
    }

    const { error: completionError } = await db
      .from('brands')
      .update({ timezone, config: updatedConfig })
      .eq('id', brandId)
    if (completionError) throw completionError

    return NextResponse.json(
      {
        success: true,
        plan,
        limits: responseLimits,
        seededProductsCount: insertedProductsCount,
        tableCount: currentTableCount || finalTableCount,
        message: 'Onboarding setup completed successfully',
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error: any) {
    console.error('Onboarding complete error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Setup failed' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    )
  }
}
