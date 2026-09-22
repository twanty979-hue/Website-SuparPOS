// app/api/master-categories/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// --- 🌐 จัดการ CORS Preflight ---
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

import { getAuthContext } from '@/lib/authHelper';

async function getSupabaseAndBrand(request: Request, fallbackData?: any) {
  return getAuthContext(request, fallbackData);
}

// --- 📥 1. [GET] ดึงรายการหมวดหมู่คลังสินค้า (master_categories) ---
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const queryBrandId = url.searchParams.get('brand_id');
    const { supabase, brandId } = await getSupabaseAndBrand(request, { brand_id: queryBrandId });

    const { data, error } = await supabase
      .from('master_categories')
      .select('id, brand_id, name, sort_order, is_active, created_at')
      .eq('brand_id', brandId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        data: data || [],
        categories: data || [],
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error: any) {
    const status = error.message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { success: false, error: error.message },
      { status, headers: corsHeaders }
    );
  }
}

// --- 📤 2. [POST] สร้างหมวดหมู่คลังสินค้าใหม่ หรือ แก้ไขเดิม ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { supabase, brandId } = await getSupabaseAndBrand(request, body);

    const { id, name, sort_order, is_active } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุชื่อหมวดหมู่' },
        { status: 400, headers: corsHeaders }
      );
    }

    const payload: Record<string, any> = {
      brand_id: brandId,
      name: String(name).trim(),
      sort_order: Number(sort_order) || 0,
      is_active: is_active ?? true,
    };

    let res;
    if (id) {
      // Update
      res = await supabase
        .from('master_categories')
        .update(payload)
        .eq('id', id)
        .eq('brand_id', brandId)
        .select()
        .single();
    } else {
      // Insert
      res = await supabase
        .from('master_categories')
        .insert([payload])
        .select()
        .single();
    }

    if (res.error) throw res.error;

    return NextResponse.json(
      {
        success: true,
        data: res.data,
        category: res.data,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error: any) {
    const status = error.message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { success: false, error: error.message },
      { status, headers: corsHeaders }
    );
  }
}

// --- 🗑️ 3. [DELETE] ลบหมวดหมู่คลังสินค้า ---
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    let id = url.searchParams.get('id');
    let fallbackBrandId: string | null = url.searchParams.get('brand_id');

    try {
      const body = await request.json();
      if (body?.id) id = body.id;
      if (body?.brand_id) fallbackBrandId = body.brand_id;
    } catch (_) {}

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุ ID หมวดหมู่ที่ต้องการลบ' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { supabase, brandId } = await getSupabaseAndBrand(request, { brand_id: fallbackBrandId });

    let { error } = await supabase
      .from('master_categories')
      .delete()
      .eq('id', id)
      .eq('brand_id', brandId);

    if (error) {
      // Fallback: หากติด Foreign Key หรือมีสินค้าผูกอยู่ ให้ทำ Soft Delete โดยซ่อนไว้
      const { error: softErr } = await supabase
        .from('master_categories')
        .update({ is_active: false })
        .eq('id', id)
        .eq('brand_id', brandId);
      if (softErr) throw error;
    }

    return NextResponse.json(
      { success: true, message: 'ลบหมวดหมู่เรียบร้อยแล้ว' },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    const status = error.message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json(
      { success: false, error: error.message },
      { status, headers: corsHeaders }
    );
  }
}
