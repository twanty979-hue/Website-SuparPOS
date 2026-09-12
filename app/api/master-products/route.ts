// app/api/master-products/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// --- 🌐 จัดการ CORS Preflight สำหรับแอป Mobile ---
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

// 🔐 Helper: ฟังก์ชันแกะ Token และหา brand_id จากผู้ใช้งานจริง
function calculateEffectivePlan(brand: any) {
  const now = new Date();
  const isActive = (val: string | null) => {
    if (!val) return false;
    const d = new Date(val.replace(' ', 'T'));
    return !isNaN(d.getTime()) && d > now;
  };

  if (brand?.plan === 'ultimate' && isActive(brand.expiry_ultimate)) return 'ultimate';
  if (brand?.plan === 'pro' && isActive(brand.expiry_pro)) return 'pro';
  if (brand?.plan === 'basic' && isActive(brand.expiry_basic)) return 'basic';
  return 'free';
}

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
    .from('profiles')
    .select('brand_id, brands(timezone, plan, expiry_basic, expiry_pro, expiry_ultimate)')
    .eq('id', user.id)
    .single();

  if (!profile?.brand_id) throw new Error('No brand assigned');
  const brand = (profile as any).brands;
  const effectivePlan = calculateEffectivePlan(brand);
  return { supabase, brandId: profile.brand_id, effectivePlan };
};

// --- 📥 [GET] ดึงข้อมูลสินค้า + หมวดหมู่ + สต็อกปัจจุบัน มัดรวมในเส้นเดียว ---
export async function GET(request: Request) {
  try {
    // 🚀 แกะหา brand_id จากสิทธิ์ Token บนหลังบ้านทันที ป้องกันการแอบอ้างข้ามร้าน
    const { supabase, brandId, effectivePlan } = await getSupabaseAndBrandId(request);

    // ยิงคิวรีขนานพร้อมกัน 2 ตาราง
    const [masterProductsRes, masterCategoriesRes] = await Promise.all([
      supabase
        .from('product_master')
        .select('id, brand_id, category_id, barcode, sku, name, description, image_url, price, cost_price, is_active, created_at, stock(quantity)')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false }),
        
      supabase
        .from('master_categories')
        .select('id, name, sort_order, is_active')
        .eq('brand_id', brandId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
    ]);

    if (masterProductsRes.error) throw masterProductsRes.error;
    if (masterCategoriesRes.error) throw masterCategoriesRes.error;

    // แปลงรูปร่าง JSON ให้แกะ quantity ออกมาจากตารางย่อยสไตล์เดิมของนาย
    const formattedProducts = masterProductsRes.data?.map((p: any) => ({
      ...p,
      stock: p.stock?.quantity || 0 
    }));

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: sysSettings } = await adminClient
      .from('system_settings')
      .select('dashboard_permissions')
      .eq('id', 'global')
      .maybeSingle();

    const rawPerms = sysSettings?.dashboard_permissions?.[effectivePlan] || {};
    const maxProducts = Number(rawPerms.max_products ?? (effectivePlan === 'free' ? 50 : 0));

    return new NextResponse(JSON.stringify({ 
      success: true, 
      products: formattedProducts || [], 
      categories: masterCategoriesRes.data || [],
      max_products: maxProducts,
      total_count: formattedProducts?.length || 0,
      effective_plan: effectivePlan
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

// --- 📤 [POST] สร้างสินค้า (พร้อมตั้งสต็อก) หรือ อัปเดตข้อมูลสินค้า ---
export async function POST(request: Request) {
  try {
    // 🚀 ตรวจจับแบรนด์ด้วยสิทธิ์ระบบล็อกอิน
    const { supabase, brandId, effectivePlan } = await getSupabaseAndBrandId(request);
    
    const body = await request.json();
    const { 
      id, category_id, barcode, sku, name, 
      description, image_url, price, cost_price, is_active, stock 
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'ข้อมูลไม่ครบถ้วน จำเป็นต้องระบุชื่อสินค้า (name)' }, 
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const masterProductPayload = {
      brand_id: brandId, // ใช้ brandId ของพนักงานที่ล็อกอิน ยิงบันทึกตรงตัว
      category_id: category_id || null,
      barcode: barcode && barcode.trim() !== '' ? barcode.trim() : null,
      sku: sku && sku.trim() !== '' ? sku.trim() : null,
      name: name.trim(),
      description: description || null,
      image_url: image_url || null,
      price: price !== undefined ? Number(price) : 0,
      cost_price: cost_price !== undefined ? Number(cost_price) : null,
      is_active: is_active ?? true,
      updated_at: new Date().toISOString()
    };

    if (!id) {
      // ตรวจสอบโควตาจำนวนสินค้าทั่วไป/คลังสินค้า สูงสุดตามแพ็กเกจ
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: sysSettings } = await adminClient
        .from('system_settings')
        .select('dashboard_permissions')
        .eq('id', 'global')
        .maybeSingle();

      const rawPerms = sysSettings?.dashboard_permissions?.[effectivePlan] || {};
      const maxProducts = Number(rawPerms.max_products ?? (effectivePlan === 'free' ? 50 : 0));

      if (maxProducts > 0) {
        const { count: productCount, error: countError } = await adminClient
          .from('product_master')
          .select('id', { count: 'exact', head: true })
          .eq('brand_id', brandId)
          .eq('is_active', true);

        if (!countError && (productCount ?? 0) >= maxProducts) {
          return NextResponse.json(
            {
              success: false,
              error: `จำนวนสินค้าเกินขีดจำกัดของแพ็กเกจ (สูงสุด ${maxProducts} รายการ) กรุณาอัปเกรดแพ็กเกจ`,
            },
            { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } }
          );
        }
      }
    }

    if (id) {
      // 🔄 อัปเดตข้อมูลสินค้าหลักเซฟทับตัวเดิม
      const { data, error } = await supabase
        .from('product_master')
        .update(masterProductPayload)
        .eq('id', id)
        .eq('brand_id', brandId) // ล็อกขอบเขตกันสวมรอยแก้ออบเจกต์ข้ามแบรนด์
        .select()
        .single();

      if (error) throw error;
      return new NextResponse(JSON.stringify({ success: true, message: 'อัปเดตข้อมูลสำเร็จ', data }), {
        status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });

    } else {
      // 🆕 สร้างข้อมูลสินค้าชิ้นใหม่พร้อมแสตมป์ประวัติสต็อกเริ่มต้น
      const { data: newProduct, error: productError } = await supabase
        .from('product_master')
        .insert([{ ...masterProductPayload, created_at: new Date().toISOString() }])
        .select()
        .single();

      if (productError) throw productError;

      const initStock = stock !== undefined ? Number(stock) : 0;

      if (initStock >= 0) {
        await supabase.from('stock').insert({ 
          product_id: newProduct.id, 
          quantity: initStock 
        });

        if (initStock > 0) {
          await supabase.from('stock_logs').insert({
            product_id: newProduct.id,
            change_amount: initStock,
            action_type: 'INITIAL', 
            note: 'ตั้งต้นสต็อกจากการสร้างสินค้าใหม่'
          });
        }
      }

      return new NextResponse(JSON.stringify({ success: true, message: 'สร้างสินค้าหลักและสต็อกสำเร็จ', data: newProduct }), {
        status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

  } catch (error: any) {
    let friendlyError = error.message;
    if (error.message?.includes('product_master_brand_barcode_unique')) {
      friendlyError = 'รหัสบาร์โค้ดนี้ถูกใช้งานไปแล้วในแบรนด์ของคุณ';
    } else if (error.message?.includes('product_master_brand_sku_unique')) {
      friendlyError = 'รหัส SKU นี้ถูกใช้งานไปแล้วในแบรนด์ของคุณ';
    }

    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(
      { success: false, error: friendlyError }, 
      { status, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}