import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const admin = () =>
  createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    // 1. อัปเดต Timezone ของร้าน
    await db.from('brands').update({ timezone }).eq('id', brandId)

    // 2. สร้างโต๊ะตามจำนวนที่กำหนด (ถ้ายังไม่มีโต๊ะ)
    const { count: currentTableCount } = await db
      .from('tables')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', brandId)

    const finalTableCount = Math.max(1, Math.min(Number(tableCount) || 10, 100))
    if (!currentTableCount || currentTableCount === 0) {
      const tables = Array.from({ length: finalTableCount }, (_, index) => ({
        brand_id: brandId,
        label: `T-${index + 1}`,
        capacity: 4,
        status: 'available',
        access_token: generateRandomToken(),
      }))
      const { error: tableError } = await db.from('tables').insert(tables)
      if (tableError) console.error('Table creation error:', tableError)
    }

    // 3. สร้างแบนเนอร์ร้าน
    const bannerUrl =
      selectedBannerUrl && selectedBannerUrl.trim().length > 0
        ? selectedBannerUrl.trim()
        : 'https://img.pos-foodscan.com/268dccbf-a568-4a90-b184-d23811937d9f/1772290694984-1772290692774.webp'

    const { count: bannerCount } = await db
      .from('banners')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', brandId)

    if (!bannerCount || bannerCount === 0) {
      const { error: bannerError } = await db.from('banners').insert({
        brand_id: brandId,
        image_name: bannerUrl,
        title: 'Welcome',
        sort_order: 1,
      })
      if (bannerError) console.error('Banner creation error:', bannerError)
    }

    // 4. สร้างหมวดหมู่และสินค้าเฉพาะที่เลือก
    let insertedProductsCount = 0
    if (Array.isArray(selectedProducts) && selectedProducts.length > 0) {
      // รวมหมวดหมู่ที่ไม่ซ้ำกัน
      const categoryNames = Array.from(
        new Set(
          selectedProducts
            .map((p: any) => p.category_name?.trim())
            .filter((name: string) => name && name.length > 0)
        )
      )

      const categoryMap: Record<string, string> = {}
      for (const catName of categoryNames) {
        // เช็คว่ามีหมวดหมู่นี้ในร้านแล้วหรือไม่
        const { data: existingCat } = await db
          .from('categories')
          .select('id')
          .eq('brand_id', brandId)
          .eq('name', catName)
          .maybeSingle()

        if (existingCat) {
          categoryMap[catName as string] = existingCat.id
        } else {
          const { data: createdCat, error: catError } = await db
            .from('categories')
            .insert({ brand_id: brandId, name: catName, is_active: true })
            .select('id')
            .single()

          if (!catError && createdCat) {
            categoryMap[catName as string] = createdCat.id
          }
        }
      }

      // แปลงข้อมูลสินค้าเพื่อบันทึกลงตาราง products
      const productsToInsert = selectedProducts.map((p: any, index: number) => ({
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
        console.error('Product insertion error:', prodError)
      } else if (insertedProducts) {
        insertedProductsCount = insertedProducts.length
      }
    }

    return NextResponse.json(
      {
        success: true,
        seededProductsCount: insertedProductsCount,
        tableCount: finalTableCount,
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
