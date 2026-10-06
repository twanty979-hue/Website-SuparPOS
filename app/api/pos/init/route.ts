// app/api/pos/init/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

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
import { getBrandPlanPermissions } from '@/lib/planPermissions';

const getSupabaseAndBrandId = async (request: Request, body?: any) => {
  return getAuthContext(request, body);
};

const buildToppingOptions = (
  groups: any[] = [],
  items: any[] = [],
  mappings: any[] = [],
  productId: string
) => {
  const assignedGroupIds = new Set(
    (mappings || [])
      .filter((row: any) => row.product_id === productId)
      .map((row: any) => String(row.group_id))
  );
  return (groups || [])
    .filter((group: any) => assignedGroupIds.has(String(group.id)))
    .sort((a: any, b: any) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .map((group: any) => ({
      id: group.id,
      name: group.name,
      type: group.type || 'multiple',
      required: group.required || false,
      source: 'topping_group',
      choices: (items || [])
        .filter((item: any) => String(item.group_id) === String(group.id) && item.is_active !== false)
        .sort((a: any, b: any) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
        .map((item: any) => ({
          id: item.id,
          name: item.name,
          image_name: item.image_name || null,
          image_url: item.image_name || null,
          price: Number(item.price || 0),
        })),
    }));
};

export async function GET(request: Request) {
  try {
    // 🚀 ใช้ Token ดึงสิทธิ์แทน URL
    const { supabase, brandId } = await getSupabaseAndBrandId(request);

    const [categoriesRes, productsRes, retailRes, discountsRes, tablesRes, unpaidOrdersRes, groupsRes, itemsRes, mappingsRes] = await Promise.all([
      supabase.from('categories').select('*').eq('brand_id', brandId).order('sort_order'),
      supabase.from('products').select('*').eq('brand_id', brandId).eq('is_available', true).is('deleted_at', null).order('created_at', { ascending: true }), 
      supabase.from('product_master').select('*').eq('brand_id', brandId).eq('is_active', true).order('created_at', { ascending: true }), 
      supabase.from('discounts').select(`*, discount_products(product_id)`).eq('brand_id', brandId).eq('is_active', true),
      supabase.from('tables').select('*').eq('brand_id', brandId).eq('is_active', true).order('label'),
      supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('brand_id', brandId)
        
        .in('status', ['pending', 'preparing', 'done']),
      supabase.from('topping_groups').select('*').eq('brand_id', brandId).eq('is_active', true).order('sort_order'),
      supabase.from('topping_items').select('*').eq('brand_id', brandId).eq('is_active', true).order('sort_order'),
      supabase.from('product_topping_groups').select('product_id, group_id').eq('brand_id', brandId)
    ]);

    const allToppingOptions = (groupsRes.data || [])
      .sort((a: any, b: any) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
      .map((group: any) => ({
        id: group.id,
        name: group.name,
        type: group.type || 'multiple',
        required: false,
        source: 'pos_topping_group',
        choices: (itemsRes.data || [])
          .filter((item: any) => String(item.group_id) === String(group.id) && item.is_active !== false)
          .sort((a: any, b: any) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
          .map((item: any) => ({
            id: item.id,
            name: item.name,
            image_name: item.image_name || null,
            image_url: item.image_name || null,
            price: Number(item.price || 0),
          })),
      }));

    let maxFoodItems = 0;
    let maxTables = 0;
    try {
      const { limits: planLimits } = await getBrandPlanPermissions(supabase, brandId);
      maxFoodItems = planLimits.max_food_items || 0;
      maxTables = planLimits.max_tables || 0;
    } catch (_) {}

    const formattedFood = (productsRes.data || []).map((p, index) => {
      const isLocked = maxFoodItems > 0 && index >= maxFoodItems;
      return {
        ...p,
        is_locked: isLocked,
        lock_reason: isLocked ? 'over_quota' : null,
        item_type: 'food',
        topping_group_ids: (mappingsRes.data || [])
          .filter((row: any) => row.product_id === p.id)
          .map((row: any) => row.group_id),
        options: [
          ...buildToppingOptions(groupsRes.data || [], itemsRes.data || [], mappingsRes.data || [], p.id),
          ...((Array.isArray(p.options) ? p.options : []) as any[])
            .filter((option: any) => option?.source !== 'topping_group'),
        ],
      };
    });
    const formattedRetail = (retailRes.data || []).map(p => ({
        ...p,
        item_type: 'retail',
        price_special: null,
        price_jumbo: null,
        is_available: p.is_active
    }));
    const allCombinedProducts = [...formattedFood, ...formattedRetail];
    const lockedFoodCount = maxFoodItems > 0 ? Math.max(0, (productsRes.data || []).length - maxFoodItems) : 0;

    const rawTables = tablesRes.data || [];
    const sortedTablesByCreated = [...rawTables].sort((a: any, b: any) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      return timeA - timeB;
    });
    const allowedTableIds = new Set(
      (maxTables > 0 ? sortedTablesByCreated.slice(0, maxTables) : sortedTablesByCreated).map((t: any) => String(t.id))
    );
    const formattedTables = rawTables.map((t: any) => {
      const isLocked = maxTables > 0 && !allowedTableIds.has(String(t.id));
      return {
        ...t,
        is_locked: isLocked,
        lock_reason: isLocked ? 'over_quota' : null,
      };
    });
    const lockedTableCount = maxTables > 0 ? Math.max(0, rawTables.length - maxTables) : 0;

    const response = NextResponse.json({
      success: true,
      categories: categoriesRes.data || [],
      products: allCombinedProducts,
      topping_options: allToppingOptions,
      discounts: discountsRes.data || [],
      tables: formattedTables,
      unpaid_orders: unpaidOrdersRes.data || [],
      max_food_items: maxFoodItems,
      locked_food_count: lockedFoodCount,
      max_tables: maxTables,
      locked_table_count: lockedTableCount,
    });

    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;

  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
