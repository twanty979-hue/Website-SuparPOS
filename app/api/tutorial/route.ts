import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { exceedsLimit, getBrandPlanPermissions } from '@/lib/planPermissions';
import { getAuthenticatedUser } from '@/lib/authHelper';

const admin = () =>
  createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

const generateRandomToken = () => Math.random().toString(36).substring(2, 10);

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
    const authorization = request.headers.get('authorization');
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : null;

    if (!token) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบใหม่' }, { status: 401 });
    }

    const { user, adminClient: db } = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' }, { status: 401 });
    }

    const body = await request.json();
    const {
      brandId,
      timezone = 'Asia/Bangkok',
      tableCount: reqTableCount = 10,
      foodItemCount: reqFoodItemCount = 6,
    } = body;

    if (!brandId) {
      return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน (ไม่พบรหัสร้านค้า)' }, { status: 400 });
    }

    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('brand_id')
      .eq('id', user.id)
      .maybeSingle();
    if (profileError) throw profileError;
    if (profile?.brand_id !== brandId) {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์ตั้งค่าร้านนี้' }, { status: 403 });
    }

    const { plan, limits } = await getBrandPlanPermissions(db, brandId);
    const responseLimits = {
      max_food_items: limits.max_food_items,
      max_products: limits.max_products,
      max_tables: limits.max_tables,
    };
    const countToCreate = Math.max(1, Math.min(100, Math.floor(Number(reqTableCount) || 10)));
    const foodItemsToCreate = Math.max(1, Math.min(6, Math.floor(Number(reqFoodItemCount) || 6)));

    if (exceedsLimit(countToCreate, limits.max_tables)) {
      return NextResponse.json({
        error: `แพ็กเกจ ${plan.toUpperCase()} สร้างได้สูงสุด ${limits.max_tables} โต๊ะ`,
        code: 'TABLE_LIMIT_EXCEEDED',
        plan,
        limits: responseLimits,
      }, { status: 403 });
    }
    if (exceedsLimit(foodItemsToCreate, limits.max_food_items)) {
      return NextResponse.json({
        error: `แพ็กเกจ ${plan.toUpperCase()} เพิ่มอาหารได้สูงสุด ${limits.max_food_items} รายการ`,
        code: 'FOOD_LIMIT_EXCEEDED',
        plan,
        limits: responseLimits,
      }, { status: 403 });
    }
    if (exceedsLimit(foodItemsToCreate, limits.max_products)) {
      return NextResponse.json({
        error: `แพ็กเกจ ${plan.toUpperCase()} เพิ่มสินค้าได้สูงสุด ${limits.max_products} รายการ`,
        code: 'PRODUCT_LIMIT_EXCEEDED',
        plan,
        limits: responseLimits,
      }, { status: 403 });
    }

    // อัปเดต Timezone ของร้าน
    const { error: timezoneError } = await db.from('brands').update({ timezone }).eq('id', brandId);
    if (timezoneError) throw timezoneError;

    // 1. สร้างโต๊ะเริ่มต้น (Default: 10 โต๊ะ T-01 ถึง T-10)
    const { count: existingTables, error: tableCountError } = await db
      .from('tables')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', brandId)
      .eq('is_active', true);
    if (tableCountError) throw tableCountError;

    if (!existingTables || existingTables === 0) {
      const tables = Array.from({ length: countToCreate }, (_, index) => {
        const num = String(index + 1).padStart(2, '0');
        return {
          brand_id: brandId,
          label: `T-${num}`,
          capacity: 4,
          status: 'available',
          is_active: true,
          access_token: generateRandomToken(),
        };
      });
      const { error: tableInsertError } = await db.from('tables').insert(tables);
      if (tableInsertError) throw tableInsertError;
    }

    // 2. สร้างแบนเนอร์เริ่มต้น (Default Welcome Banner)
    const { count: bannerCount, error: bannerCountError } = await db
      .from('banners')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', brandId);
    if (bannerCountError) throw bannerCountError;

    if (!bannerCount || bannerCount === 0) {
      const { error: bannerInsertError } = await db.from('banners').insert({
        brand_id: brandId,
        image_name: 'https://img.pos-foodscan.com/268dccbf-a568-4a90-b184-d23811937d9f/1772290694984-1772290692774.webp',
        title: 'ยินดีต้อนรับสู่ร้านค้า',
        sort_order: 1,
        is_active: true,
      });
      if (bannerInsertError) throw bannerInsertError;
    }

    // 3. สร้างหมวดหมู่และเมนูสินค้าเริ่มต้น (Default Categories & Master Products)
    const { count: productCount, error: productCountError } = await db
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', brandId);
    if (productCountError) throw productCountError;

    let seededProducts = false;
    if (!productCount || productCount === 0) {
      const { count: currentMasterProductCount, error: masterProductCountError } = await db
        .from('product_master')
        .select('id', { count: 'exact', head: true })
        .eq('brand_id', brandId)
        .eq('is_active', true);
      if (masterProductCountError) throw masterProductCountError;
      if (exceedsLimit((currentMasterProductCount || 0) + foodItemsToCreate, limits.max_products)) {
        return NextResponse.json({
          error: `จำนวนสินค้ารวมเกินลิมิตแพ็กเกจ ${limits.max_products} รายการ`,
          code: 'PRODUCT_LIMIT_EXCEEDED',
          plan,
          limits: responseLimits,
        }, { status: 403 });
      }

      const defaultCategories = [
        { name: 'อาหารจานเดียว', sort: 1 },
        { name: 'กับข้าว', sort: 2 },
        { name: 'เครื่องดื่ม', sort: 3 },
        { name: 'ของทานเล่น', sort: 4 },
      ];

      const categoryMap: Record<string, string> = {};
      for (const cat of defaultCategories) {
        const { data: existingCat, error: categoryReadError } = await db
          .from('categories')
          .select('id')
          .eq('brand_id', brandId)
          .eq('name', cat.name)
          .maybeSingle();
        if (categoryReadError) throw categoryReadError;

        if (existingCat?.id) {
          categoryMap[cat.name] = existingCat.id;
          continue;
        }

        const { data: createdCat, error: categoryCreateError } = await db
          .from('categories')
          .insert({ brand_id: brandId, name: cat.name, is_active: true })
          .select('id')
          .single();
        if (categoryCreateError) throw categoryCreateError;
        categoryMap[cat.name] = createdCat.id;
      }

      // เมนูสินค้าเริ่มต้นพร้อมรูปภาพและราคา
      const defaultSampleProducts = [
        {
          name: 'ข้าวกะเพราหมูกรอบไข่ดาว',
          price: 65,
          cost_price: 35,
          category: 'อาหารจานเดียว',
          image_name: 'https://img.pos-foodscan.com/268dccbf-a568-4a90-b184-d23811937d9f/1772290694984-1772290692774.webp',
          is_recommended: true,
        },
        {
          name: 'ข้าวผัดต้มยำกุ้ง',
          price: 80,
          cost_price: 45,
          category: 'อาหารจานเดียว',
          image_name: 'https://img.pos-foodscan.com/268dccbf-a568-4a90-b184-d23811937d9f/1772290694984-1772290692774.webp',
          is_recommended: true,
        },
        {
          name: 'ต้มยำกุ้งน้ำข้น',
          price: 150,
          cost_price: 80,
          category: 'กับข้าว',
          image_name: 'https://img.pos-foodscan.com/268dccbf-a568-4a90-b184-d23811937d9f/1772290694984-1772290692774.webp',
          is_recommended: true,
        },
        {
          name: 'ปีกไก่ทอดน้ำปลา',
          price: 90,
          cost_price: 50,
          category: 'ของทานเล่น',
          image_name: 'https://img.pos-foodscan.com/268dccbf-a568-4a90-b184-d23811937d9f/1772290694984-1772290692774.webp',
          is_recommended: false,
        },
        {
          name: 'ชาไทยเย็น (สูตรเข้มข้น)',
          price: 45,
          cost_price: 18,
          category: 'เครื่องดื่ม',
          image_name: 'https://img.pos-foodscan.com/268dccbf-a568-4a90-b184-d23811937d9f/1772290694984-1772290692774.webp',
          is_recommended: true,
        },
        {
          name: 'น้ำผึ้งมะนาวโซดา',
          price: 50,
          cost_price: 20,
          category: 'เครื่องดื่ม',
          image_name: 'https://img.pos-foodscan.com/268dccbf-a568-4a90-b184-d23811937d9f/1772290694984-1772290692774.webp',
          is_recommended: false,
        },
      ];

      for (const p of defaultSampleProducts.slice(0, foodItemsToCreate)) {
        // 1. บันทึกเข้า product_master
        const { data: masterProd, error: masterProductError } = await db
          .from('product_master')
          .insert({
            brand_id: brandId,
            name: p.name,
            price: p.price,
            cost_price: p.cost_price,
            image_url: p.image_name,
            category_name: p.category,
            is_active: true,
          })
          .select('id')
          .single();
        if (masterProductError) throw masterProductError;

        // 2. บันทึกเข้า products สำหรับ POS หน้าร้าน
        const { error: productInsertError } = await db.from('products').insert({
          brand_id: brandId,
          name: p.name,
          price: p.price,
          image_name: p.image_name,
          category_id: categoryMap[p.category] || null,
          product_master_id: masterProd?.id || null,
          is_available: true,
          is_recommended: p.is_recommended,
        });
        if (productInsertError) throw productInsertError;

        // 3. บันทึกเข้า stock สต็อกเริ่มต้น (100 ชิ้น)
        if (masterProd.id) {
          const { error: stockInsertError } = await db.from('stock').insert({
            product_master_id: masterProd.id,
            quantity: 100,
            min_quantity: 10,
          });
          if (stockInsertError) throw stockInsertError;
        }
      }

      seededProducts = true;
    }

    const { data: currentBrand, error: brandReadError } = await db
      .from('brands')
      .select('config')
      .eq('id', brandId)
      .maybeSingle();
    if (brandReadError) throw brandReadError;
    const currentConfig = currentBrand?.config && typeof currentBrand.config === 'object'
      ? currentBrand.config as Record<string, unknown>
      : {};
    const { error: completionError } = await db
      .from('brands')
      .update({ config: { ...currentConfig, onboarding_completed: true } })
      .eq('id', brandId);
    if (completionError) throw completionError;

    return NextResponse.json({
      success: true,
      plan,
      limits: responseLimits,
      seededProducts,
      seededProductsCount: seededProducts ? foodItemsToCreate : 0,
      tableCount: countToCreate,
      message: 'เริ่มต้นระบบและสร้างข้อมูลเริ่มต้นเรียบร้อยแล้ว',
    });
  } catch (error: any) {
    console.error('Tutorial API error:', error);
    return NextResponse.json(
      { error: error?.message || 'เกิดข้อผิดพลาดในการตั้งค่าเริ่มต้น' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
