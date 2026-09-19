// app/api/kitchen/update-status/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 🌟 เพิ่ม CORS ให้ Flutter ยิงผ่านได้
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

import { getAuthContext } from '@/lib/authHelper';

const getSupabaseAndBrandId = async (request: Request, body?: any) => {
  return getAuthContext(request, body);
};

export async function POST(request: Request) {
    try {
        const { supabase, brandId } = await getSupabaseAndBrandId(request);
        const body = await request.json();
        const { orderId, status } = body;

        if (!orderId || !status) {
            return NextResponse.json({ success: false, error: 'Missing orderId or status' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
        }

        // 🌟 สั่งอัปเดตสถานะ (ล็อกด้วย brand_id)
        const { error } = await supabase
            .from('orders')
            .update({ status: status, updated_at: new Date().toISOString() })
            .eq('id', orderId)
            .eq('brand_id', brandId);

        if (error) throw error;

        return NextResponse.json({ success: true }, { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });

    } catch (error: any) {
        console.error("❌ [API] Update Kitchen Status Error:", error);
        const status = error.message === 'Unauthorized' ? 401 : 500;
        return NextResponse.json({ success: false, error: error.message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
}