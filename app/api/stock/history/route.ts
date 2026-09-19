import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Set CORS Headers ให้ Flutter เรียกใช้ได้
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ดัก OPTIONS request
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

import { getAuthContext } from '@/lib/authHelper';

export async function GET(req: Request) {
  try {
    const { supabase, brandId } = await getAuthContext(req);

    // 5. Query ประวัติสต็อก (ใช้ Logic คล้าย Server Action ฝั่งเว็บ)
    const { data: txData, error: txErr } = await supabase
      .from('stock_transactions')
      .select(`
        id, ref_no, note, created_at,
        stock_logs (
          id, change_amount, action_type,
          product_master!inner(id, name, image_url, barcode)
        )
      `)
      .eq('brand_id', brandId)
      .not('ref_no', 'ilike', 'POS-%') // กรองบิลขายย่อยออก
      .order('created_at', { ascending: false });

    if (txErr) throw txErr;

    // ส่งคืนข้อมูลให้ Flutter
    return NextResponse.json({ success: true, data: txData }, { headers: corsHeaders });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400, headers: corsHeaders }
    );
  }
}