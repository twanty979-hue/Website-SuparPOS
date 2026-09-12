import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

const getSupabase = (request: Request) => {
  const authHeader = request.headers.get('authorization');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader || '' } } }
  );
};

export async function GET(request: Request) {
  try {
    const supabase = getSupabase(request);

    // เรียงตามความนิยม (import_count สูงสุดขึ้นก่อน) ตามด้วยสินค้าใหม่ล่าสุด
    const [productsRes, categoriesRes] = await Promise.all([
      supabase
        .from('admin_product_master')
        .select('*')
        .order('import_count', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase
        .from('admin_master_categories')
        .select('*')
        .order('sort_order', { ascending: true })
    ]);

    if (productsRes.error) throw productsRes.error;
    if (categoriesRes.error) throw categoriesRes.error;

    const response = NextResponse.json({
      success: true,
      products: productsRes.data || [],
      categories: categoriesRes.data || [],
    });

    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabase(request);
    const body = await request.json();

    const { id, category_id, name, description, image_url, price, cost_price, barcode, sku, is_active, is_pack } = body;

    let res;
    if (id) {
      // Update
      res = await supabase
        .from('admin_product_master')
        .update({
          category_id: category_id || null,
          name,
          description: description || null,
          image_url: image_url || null,
          price: Number(price) || 0,
          cost_price: Number(cost_price) || 0,
          barcode: barcode || null,
          sku: sku || null,
          is_active: is_active !== false,
          is_pack: Boolean(is_pack),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
    } else {
      // Insert
      res = await supabase
        .from('admin_product_master')
        .insert({
          category_id: category_id || null,
          name,
          description: description || null,
          image_url: image_url || null,
          price: Number(price) || 0,
          cost_price: Number(cost_price) || 0,
          barcode: barcode || null,
          sku: sku || null,
          is_active: is_active !== false,
          is_pack: Boolean(is_pack),
          import_count: 0
        })
        .select()
        .single();
    }

    if (res.error) throw res.error;

    const response = NextResponse.json({ success: true, data: res.data });
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

// อัปเดตคะแนนความนิยมเมื่อมีการนำเข้าสินค้า (Increment Import Count)
export async function PATCH(request: Request) {
  try {
    const supabase = getSupabase(request);
    const body = await request.json();
    const { action, product_ids } = body;

    if (action === 'increment_import' && Array.isArray(product_ids) && product_ids.length > 0) {
      const { error } = await supabase.rpc('increment_admin_product_import', {
        product_ids
      });
      if (error) throw error;
      const response = NextResponse.json({ success: true, count: product_ids.length });
      response.headers.set('Access-Control-Allow-Origin', '*');
      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
