// app/api/kitchen/orders/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// --- 🌐 จัดการ CORS Preflight สำหรับจอห้องครัว ---
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

import { getAuthContext } from '@/lib/authHelper';

const getSupabaseAndBrandId = async (request: Request, body?: any) => {
  return getAuthContext(request, body);
};

export async function GET(request: Request) {
  try {
    // 🚀 สไตล์ SaaS แท้: ดึงท่อเชื่อมต่อและ brandId จาก Token โดยตรง (ไม่ต้องง้อ URL พ่วงไอดี)
    const { supabase, brandId } = await getSupabaseAndBrandId(request);

    // ดึงออเดอร์ที่ค้างคาอยู่ในห้องครัว
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('brand_id', brandId) // ป้องกันการดึงข้ามร้านอย่างเด็ดขาด
      .in('status', ['pending', 'preparing'])
      .order('created_at', { ascending: true });

    if (error) throw error;

    const response = NextResponse.json({ success: true, data: data });
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;

  } catch (error: any) {
    console.error("❌ [API] Get Kitchen Orders Error:", error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}