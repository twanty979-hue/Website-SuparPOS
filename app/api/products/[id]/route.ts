import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

import { getAuthContext } from '@/lib/authHelper';

const getSupabaseAndBrandId = async (request: Request, productId?: string) => {
  return getAuthContext(request, { id: productId, tableName: 'products' });
};

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { supabase, brandId } = await getSupabaseAndBrandId(request, id);

    // Permanently delete from database
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('brand_id', brandId);

    if (error) throw error;

    return NextResponse.json({ success: true }, {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(
      { success: false, error: error.message },
      { status, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
