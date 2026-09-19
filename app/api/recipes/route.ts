import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    },
  });
}

import { getAuthContext } from '@/lib/authHelper';

async function getContext(request: Request, body?: any) {
  return getAuthContext(request, body);
}

export async function GET(request: Request) {
  try {
    const { supabase, brandId } = await getContext(request);
    const productId = new URL(request.url).searchParams.get('product_id');
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'product_id is required' },
        { status: 400, headers: corsHeaders },
      );
    }

    const { data, error } = await supabase
      .from('product_recipes')
      .select(
        `
          id,
          product_id,
          variant_key,
          version,
          yield_quantity,
          effective_from,
          product_recipe_items (
            id,
            ingredient_id,
            quantity_base,
            waste_percent,
            ingredients (
              name,
              base_unit
            )
          )
        `,
      )
      .eq('brand_id', brandId)
      .eq('product_id', productId)
      .eq('is_active', true)
      .is('effective_to', null)
      .order('variant_key');
    if (error) throw error;

    return NextResponse.json(
      { success: true, recipes: data || [] },
      { headers: corsHeaders },
    );
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(
      { success: false, error: error.message },
      { status, headers: corsHeaders },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, brandId } = await getContext(request);
    const body = await request.json();
    const variantKey = String(body.variant_key || 'normal');
    const items = Array.isArray(body.items) ? body.items : [];

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', body.product_id)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .maybeSingle();
    if (productError) throw productError;
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404, headers: corsHeaders },
      );
    }

    if (
      !['normal', 'special', 'jumbo'].includes(variantKey) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid recipe data' },
        { status: 400, headers: corsHeaders },
      );
    }

    const normalizedItems = items.map((item: any) => ({
      ingredient_id: item.ingredient_id,
      quantity_base: Number(item.quantity_base),
      waste_percent: Number(item.waste_percent || 0),
    }));
    const { data, error } = await supabase.rpc('save_product_recipe', {
      p_product_id: product.id,
      p_variant_key: variantKey,
      p_yield_quantity: Number(body.yield_quantity || 1),
      p_items: normalizedItems,
    });
    if (error) throw error;

    return NextResponse.json(
      { success: true, recipe_id: data },
      { headers: corsHeaders },
    );
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(
      { success: false, error: error.message },
      { status, headers: corsHeaders },
    );
  }
}
