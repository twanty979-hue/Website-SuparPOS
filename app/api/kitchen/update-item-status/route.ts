// app/api/kitchen/update-item-status/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

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
    const { supabase } = await getSupabaseAndBrandId(request);
    
    const body = await request.json();
    const { itemId, status } = body;

    if (!itemId || !status) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    let updateData: any = { status: status };

    const { error } = await supabase
      .from('order_items')
      .update(updateData)
      .eq('id', itemId);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });

  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}