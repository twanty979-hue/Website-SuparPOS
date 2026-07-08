// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// --- 🌐 จัดการ CORS Preflight ---
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// 🔐 Helper: แกะ Token หา brand_id ของพนักงาน
const getSupabaseAndBrandId = async (request: Request) => {
  const authHeader = request.headers.get('authorization');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader || '' } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles').select('brand_id').eq('id', user.id).single();

  if (!profile?.brand_id) throw new Error('No brand assigned');
  return { supabase, brandId: profile.brand_id };
};

const buildToppingOptions = (
  groups: any[] = [],
  items: any[] = [],
  mappings: any[] = [],
  productId?: string
) => {
  const assignedGroupIds = new Set(
    (mappings || [])
      .filter((row: any) => !productId || row.product_id === productId)
      .map((row: any) => String(row.group_id))
  );
  return (groups || [])
    .filter((group: any) => assignedGroupIds.has(String(group.id)))
    .sort((a: any, b: any) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .map((group: any) => ({
      id: group.id,
      name: group.name,
      type: group.type || 'multiple',
      required: group.required || false,
      source: 'topping_group',
      choices: (items || [])
        .filter((item: any) => String(item.group_id) === String(group.id) && item.is_active !== false)
        .sort((a: any, b: any) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
        .map((item: any) => ({
          id: item.id,
          name: item.name,
          image_name: item.image_name || null,
          image_url: item.image_name || null,
          price: Number(item.price || 0),
        })),
    }));
};

// --- 📥 [GET] ดึงข้อมูลสินค้าและหมวดหมู่ของร้านตัวเอง ---
export async function GET(request: Request) {
  try {
    // 🚀 แกะ brand_id จาก Token ไม่ต้องรอรับจาก URL
    const { supabase, brandId } = await getSupabaseAndBrandId(request);

    // ยิงคิวรีขนานพร้อมกัน 2 ตาราง
    const [productsRes, categoriesRes, groupsRes, itemsRes, mappingsRes] = await Promise.all([
      supabase
        .from('products')
        .select('id, brand_id, category_id, name, description, image_name, price, price_special, price_jumbo, options, is_available, is_recommended')
        .eq('brand_id', brandId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),
        
      supabase
        .from('categories')
        .select('id, name, sort_order, is_active')
        .eq('brand_id', brandId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),

      supabase
        .from('topping_groups')
        .select('*')
        .eq('brand_id', brandId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),

      supabase
        .from('topping_items')
        .select('*')
        .eq('brand_id', brandId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),

      supabase
        .from('product_topping_groups')
        .select('product_id, group_id')
        .eq('brand_id', brandId)
    ]);

    if (productsRes.error) throw productsRes.error;
    if (categoriesRes.error) throw categoriesRes.error;
    if (groupsRes.error) throw groupsRes.error;
    if (itemsRes.error) throw itemsRes.error;
    if (mappingsRes.error) throw mappingsRes.error;

    const productsWithToppings = (productsRes.data || []).map((product: any) => {
      const toppingGroupIds = (mappingsRes.data || [])
        .filter((row: any) => row.product_id === product.id)
        .map((row: any) => row.group_id);
      const toppingOptions = buildToppingOptions(
        groupsRes.data || [],
        itemsRes.data || [],
        mappingsRes.data || [],
        product.id
      );
      return {
        ...product,
        topping_group_ids: toppingGroupIds,
        options: [
          ...toppingOptions,
          ...((Array.isArray(product.options) ? product.options : []) as any[])
            .filter((option: any) => option?.source !== 'topping_group'),
        ],
      };
    });

    return new NextResponse(JSON.stringify({ 
      success: true, 
      products: productsWithToppings,
      categories: categoriesRes.data || []   
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}

// --- 📤 [POST] สร้างใหม่ หรือ อัปเดตข้อมูลเมนูอาหาร ---
export async function POST(request: Request) {
  try {
    // 🚀 แกะ brand_id จาก Token ป้องกันการปลอมแปลง
    const { supabase, brandId } = await getSupabaseAndBrandId(request);
    
    const body = await request.json();
    const { 
      id, category_id, name, description, image_name, 
      price, price_special, price_jumbo, options, topping_group_ids, is_recommended, is_available 
    } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'ข้อมูลไม่ครบถ้วน บังคับระบุ name และ price' }, 
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const productPayload = {
      brand_id: brandId, // ใช้ brandId จากระบบชัวร์ 100%
      category_id: category_id || null,
      name,
      description: description || null,
      image_name: image_name || null,
      price: Number(price),
      price_special: price_special ? Number(price_special) : null,
      price_jumbo: price_jumbo ? Number(price_jumbo) : null,
      options: Array.isArray(options)
        ? options.filter((option: any) => option?.source !== 'topping_group')
        : [],
      is_recommended: is_recommended ?? false,
      is_available: is_available ?? true,
      updated_at: new Date().toISOString()
    };

    if (id) {
      const { data, error } = await supabase
        .from('products')
        .update(productPayload)
        .eq('id', id)
        .eq('brand_id', brandId) // ล็อกความปลอดภัยข้ามร้าน
        .select()
        .single();

      if (error) throw error;
      if (Array.isArray(topping_group_ids)) {
        await supabase
          .from('product_topping_groups')
          .delete()
          .eq('brand_id', brandId)
          .eq('product_id', id);
        const rows = topping_group_ids.filter(Boolean).map((groupId: string) => ({
          brand_id: brandId,
          product_id: id,
          group_id: groupId,
        }));
        if (rows.length > 0) {
          const { error: mappingError } = await supabase
            .from('product_topping_groups')
            .insert(rows);
          if (mappingError) throw mappingError;
        }
      }
      return new NextResponse(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert([{ ...productPayload, created_at: new Date().toISOString() }])
        .select()
        .single();

      if (error) throw error;
      if (Array.isArray(topping_group_ids) && data?.id) {
        const rows = topping_group_ids.filter(Boolean).map((groupId: string) => ({
          brand_id: brandId,
          product_id: data.id,
          group_id: groupId,
        }));
        if (rows.length > 0) {
          const { error: mappingError } = await supabase
            .from('product_topping_groups')
            .insert(rows);
          if (mappingError) throw mappingError;
        }
      }
      return new NextResponse(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
  } 
}
