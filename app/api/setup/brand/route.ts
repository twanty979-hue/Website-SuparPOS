import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseServer';
import { getAuthenticatedUser } from '@/lib/authHelper';

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

async function seedTablesAndProducts(
  supabaseAdmin: any,
  brandId: string,
  tableCount?: number,
  products?: Array<any>
) {
  // 1. โต๊ะในร้าน (ล็อกแผนฟรีสูงสุด 10 โต๊ะ)
  const safeTableCount = Math.max(1, Math.min(Number(tableCount) || 10, 10));
  const { count: existingTableCount } = await supabaseAdmin
    .from('tables')
    .select('id', { count: 'exact', head: true })
    .eq('brand_id', brandId)
    .eq('is_active', true);

  if (!existingTableCount || existingTableCount === 0) {
    const tables = Array.from({ length: safeTableCount }, (_, i) => {
      const num = String(i + 1).padStart(2, '0');
      return {
        brand_id: brandId,
        label: `T-${num}`,
        capacity: 4,
        status: 'available',
        is_active: true,
        access_token: Math.random().toString(36).substring(2, 10).toUpperCase(),
      };
    });
    await supabaseAdmin.from('tables').insert(tables);
  }

  // 2. แบนเนอร์เริ่มต้น (Welcome Banner)
  const { count: bannerCount } = await supabaseAdmin
    .from('banners')
    .select('id', { count: 'exact', head: true })
    .eq('brand_id', brandId);

  if (!bannerCount || bannerCount === 0) {
    await supabaseAdmin.from('banners').insert({
      brand_id: brandId,
      image_name: 'https://img.pos-foodscan.com/268dccbf-a568-4a90-b184-d23811937d9f/1772290694984-1772290692774.webp',
      title: 'ยินดีต้อนรับสู่ร้านค้า',
      sort_order: 1,
      is_active: true,
    });
  }

  // 3. เมนูอาหารและหมวดหมู่ (อย่างน้อย 1 รายการ)
  if (Array.isArray(products) && products.length > 0) {
    const categoryMap = new Map<string, string>();
    for (const p of products) {
      const catName = String(p.category_name || p.category || 'อาหารทั่วไป').trim();
      if (!categoryMap.has(catName)) {
        const { data: existingCat } = await supabaseAdmin
          .from('categories')
          .select('id')
          .eq('brand_id', brandId)
          .eq('name', catName)
          .maybeSingle();

        if (existingCat?.id) {
          categoryMap.set(catName, existingCat.id);
        } else {
          const { data: newCat } = await supabaseAdmin
            .from('categories')
            .insert({ brand_id: brandId, name: catName, is_active: true })
            .select('id')
            .single();
          if (newCat?.id) categoryMap.set(catName, newCat.id);
        }
      }
    }

      for (let i = 0; i < products.length; i++) {
        const p = products[i];
        const prodName = String(p.name || `เมนู ${i + 1}`).trim();
        const price = Math.max(0, Number(p.price) || 0);
        const priceSpecial = p.price_special ? Number(p.price_special) : null;
        const priceJumbo = p.price_jumbo ? Number(p.price_jumbo) : null;
        const catName = String(p.category_name || p.category || 'อาหารทั่วไป').trim();
        const catId = p.category_id || categoryMap.get(catName) || null;
        const imgUrl = p.image_url || p.image_name || null;

        // บันทึกเข้า products สำหรับหน้าร้าน POS และหน้าจัดการอาหาร
        const { error: prodErr } = await supabaseAdmin
          .from('products')
          .insert({
            brand_id: brandId,
            name: prodName,
            price: price,
            price_special: priceSpecial,
            price_jumbo: priceJumbo,
            image_name: imgUrl,
            category_id: catId,
            category: catName,
            options: Array.isArray(p.options)
              ? p.options.filter((opt: any) => opt?.source !== 'topping_group')
              : (p.options && typeof p.options === 'object' ? p.options : []),
            is_available: true,
            is_recommended: i === 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (prodErr) {
          console.error('Error inserting product:', prodErr);
          throw new Error(`บันทึกเมนู "${prodName}" ไม่สำเร็จ: ${prodErr.message}`);
        }
      }
    }

  // 4. บันทึก onboarding_completed ลงใน brands.config
  const { data: bData } = await supabaseAdmin
    .from('brands')
    .select('config')
    .eq('id', brandId)
    .maybeSingle();

  const currentConfig = (bData?.config as Record<string, any>) || {};
  await supabaseAdmin
    .from('brands')
    .update({
      config: {
        ...currentConfig,
        onboarding_completed: true,
      },
    })
    .eq('id', brandId);
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    // 🛡️ ขั้นตอนที่ 1 & 2: ตรวจสอบและดึง User จาก Token
    const { user } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "เซสชันหมดอายุหรือสิทธิ์ไม่ถูกต้อง" }, 
        { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const secureUserId = user.id;
    const body = await request.json();
    const { shopName, shopPhone, tableCount, products } = body;

    if (!shopName) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ครบถ้วน (กรุณาระบุชื่อร้าน)" }, 
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 🛑 ขั้นตอนที่ 3: เช็คเงื่อนไข (1 คน ต่อ 1 ร้าน)
    let { data: currentProfile, error: profileReadError } = await supabaseAdmin
      .from('profiles')
      .select('brand_id')
      .eq('id', secureUserId)
      .maybeSingle();

    if (profileReadError) throw profileReadError;
    if (!currentProfile) {
      const metadata = user.user_metadata || {};
      const { data: createdProfile, error: createProfileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: secureUserId,
          full_name: String(metadata.full_name || metadata.name || user.email || '').trim() || null,
          avatar_url: String(metadata.avatar_url || metadata.picture || '').trim() || null,
          updated_at: new Date().toISOString(),
        })
        .select('brand_id')
        .single();
      if (createProfileError) throw createProfileError;
      currentProfile = createdProfile;
    }

    if (currentProfile?.brand_id) {
      const existingBrandId = currentProfile.brand_id;
      // ถ้ามีการส่ง tableCount หรือ products มา ให้ seed ข้อมูลลงร้านที่มีอยู่เดิมด้วย
      if (tableCount || (Array.isArray(products) && products.length > 0)) {
        await seedTablesAndProducts(supabaseAdmin, existingBrandId, tableCount, products);
      }
      return NextResponse.json(
        { success: true, brandId: existingBrandId, alreadyExists: true, message: "ตั้งค่าร้านค้าสำเร็จ" },
        { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 🚀 ขั้นตอนที่ 4: สร้าง Brand ใหม่
    const { data: brand, error: brandErr } = await supabaseAdmin.from('brands').insert({
      name: shopName,
      phone: shopPhone,
      plan: 'free',
      status: 'trial',
      config: {
        vat: 0,
        onboarding_completed: true,
        service_charge: 0,
        tutorial_pos: false,
        tutorial_menu: false,
        tutorial_theme: false,
        tutorial_progress: {
          pos: false,
          menu: false,
          theme: false,
        },
      },
    }).select().single();

    if (brandErr) throw brandErr;

    // อัปเดต Profile ให้ผูกกับ Brand นี้
    const { error: profileErr } = await supabaseAdmin.from('profiles').update({
      brand_id: brand.id,
      own_brand_id: brand.id,
      role: 'owner',
      updated_at: new Date().toISOString()
    }).eq('id', secureUserId).select('id').single();

    if (profileErr) {
      await supabaseAdmin.from('brands').delete().eq('id', brand.id);
      throw profileErr;
    }

    // สร้างโต๊ะ (สูงสุด 10 โต๊ะ) และเมนูอาหาร (อย่างน้อย 1 เมนู)
    await seedTablesAndProducts(supabaseAdmin, brand.id, tableCount, products);

    const response = NextResponse.json({ 
      success: true, 
      brandId: brand.id,
      message: "สร้างร้านค้า ตั้งค่าโต๊ะและเมนูอาหารเริ่มต้นสำเร็จ" 
    });
    
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;

  } catch (error: any) {
    console.error('setup/brand error:', error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดภายในระบบ" }, 
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
