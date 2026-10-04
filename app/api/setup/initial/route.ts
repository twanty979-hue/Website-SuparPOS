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

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { user } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "เซสชันหมดอายุหรือสิทธิ์ไม่ถูกต้อง" }, 
        { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const body = await request.json();
    const { brandId: reqBrandId, tableCount = 10, products = [] } = body;

    // หา brandId ของผู้ใช้
    let brandId = reqBrandId;
    if (!brandId) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('brand_id')
        .eq('id', user.id)
        .maybeSingle();
      brandId = profile?.brand_id;
    }

    if (!brandId) {
      return NextResponse.json(
        { error: "ไม่พบรหัสร้านค้า" }, 
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 1. โต๊ะในร้าน (ล็อกแผนฟรีสูงสุด 10 โต๊ะ)
    const safeTableCount = Math.max(1, Math.min(Number(tableCount) || 10, 10));
    const { data: existingTables } = await supabaseAdmin
      .from('tables')
      .select('id, label')
      .eq('brand_id', brandId)
      .eq('is_active', true);

    const existingCount = existingTables?.length || 0;
    if (existingCount === 0) {
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
    } else if (existingCount < safeTableCount) {
      const diff = safeTableCount - existingCount;
      const newTables = Array.from({ length: diff }, (_, i) => {
        const num = String(existingCount + i + 1).padStart(2, '0');
        return {
          brand_id: brandId,
          label: `T-${num}`,
          capacity: 4,
          status: 'available',
          is_active: true,
          access_token: Math.random().toString(36).substring(2, 10).toUpperCase(),
        };
      });
      await supabaseAdmin.from('tables').insert(newTables);
    }

    // 2. แบนเนอร์เริ่มต้น (ถ้ายังไม่มี)
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
              .insert({
                brand_id: brandId,
                name: catName,
                sort_order: 1,
                is_active: true,
                created_at: new Date().toISOString(),
              })
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

    const response = NextResponse.json({ 
      success: true, 
      brandId,
      message: "ตั้งค่าเมนูอาหารและโต๊ะเริ่มต้นสำเร็จ" 
    });
    
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;

  } catch (error: any) {
    console.error('setup/initial error:', error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดภายในระบบ" }, 
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
