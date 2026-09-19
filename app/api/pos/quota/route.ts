// app/api/pos/quota/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getOrderUsage } from '@/app/actions/limitGuard';

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
    // 🚀 ยืนยันตัวตนก่อนเรียกฟังก์ชัน limitGuard
    const { brandId, supabase } = await getSupabaseAndBrandId(request);

    const quotaData = await getOrderUsage(brandId, supabase);

    const response = NextResponse.json({ success: true, ...quotaData });
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}