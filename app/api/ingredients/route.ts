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
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    },
  });
}

async function getContext(request: Request) {
  const authHeader = request.headers.get('authorization');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader || '' } } },
  );
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('brand_id')
    .eq('id', user.id)
    .single();
  if (profileError || !profile?.brand_id) throw new Error('No brand assigned');
  return { supabase, brandId: profile.brand_id, userId: user.id };
}

export async function GET(request: Request) {
  try {
    const { supabase, brandId } = await getContext(request);
    const params = new URL(request.url).searchParams;
    const view = params.get('view') || 'list';
    const page = Math.max(1, Number(params.get('page') || 1));
    const limit = Math.min(
      100,
      Math.max(10, Number(params.get('limit') || 50)),
    );
    const offset = (page - 1) * limit;

    if (view === 'metadata') {
      const [categoriesResult, unitsResult] = await Promise.all([
        supabase
          .from('ingredient_categories')
          .select('id, name, sort_order')
          .eq('brand_id', brandId)
          .eq('is_active', true)
          .order('sort_order')
          .order('name'),
        supabase
          .from('measurement_units')
          .select(
            'id, brand_id, code, name, symbol, dimension, factor_to_canonical, is_system',
          )
          .eq('is_active', true)
          .order('dimension')
          .order('name'),
      ]);
      if (categoriesResult.error) throw categoriesResult.error;
      if (unitsResult.error) throw unitsResult.error;
      return NextResponse.json(
        {
          success: true,
          categories: categoriesResult.data || [],
          units: unitsResult.data || [],
        },
        { headers: corsHeaders },
      );
    }

    if (view === 'history') {
      let historyQuery = supabase
        .from('ingredient_stock_movements')
        .select(
          `
            id,
            ingredient_id,
            quantity_delta,
            movement_type,
            order_id,
            note,
            created_at,
            ingredients!inner (
              name,
              base_unit,
              brand_id
            )
          `,
        )
        .eq('brand_id', brandId)
        .eq('ingredients.brand_id', brandId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit);

      const ingredientId = params.get('ingredient_id');
      if (ingredientId) {
        historyQuery = historyQuery.eq('ingredient_id', ingredientId);
      }
      const { data, error } = await historyQuery;
      if (error) throw error;
      const rows = data || [];
      return NextResponse.json(
        {
          success: true,
          movements: rows.slice(0, limit),
          page,
          has_more: rows.length > limit,
        },
        { headers: corsHeaders },
      );
    }

    let ingredientsQuery = supabase
      .from('ingredients')
      .select(
        `
          id,
          name,
          sku,
          category,
          category_id,
          base_unit,
          base_unit_id,
          minimum_stock,
          allow_negative,
          is_active,
          created_at,
          updated_at,
          ingredient_units (
            id,
            unit_id,
            unit_name,
            conversion_to_base,
            purchase_price,
            is_default_purchase_unit,
            measurement_units (
              id,
              name,
              symbol,
              dimension,
              factor_to_canonical
            )
          ),
          ingredient_categories (
            id,
            name
          ),
          measurement_units!ingredients_base_unit_id_fkey (
            id,
            name,
            symbol,
            dimension,
            factor_to_canonical
          ),
          ingredient_stock_balances (
            quantity_on_hand,
            average_cost,
            updated_at
          )
        `,
        { count: 'exact' },
      )
      .eq('brand_id', brandId)
      .eq('is_active', true)
      .order('name')
      .range(offset, offset + limit - 1);

    const search = String(params.get('search') || '').trim();
    if (search) ingredientsQuery = ingredientsQuery.ilike('name', `%${search}%`);

    const { data, error, count } = await ingredientsQuery;
    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        ingredients: data || [],
        page,
        total: count || 0,
        has_more: offset + (data?.length || 0) < (count || 0),
      },
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
    const { supabase, brandId, userId } = await getContext(request);
    const body = await request.json();

    if (body.action === 'create_category') {
      const name = String(body.name || '').trim();
      if (!name) {
        return NextResponse.json(
          { success: false, error: 'Category name is required' },
          { status: 400, headers: corsHeaders },
        );
      }
      const { data, error } = await supabase
        .from('ingredient_categories')
        .insert({ brand_id: brandId, name })
        .select('id, name, sort_order')
        .single();
      if (error) throw error;
      return NextResponse.json(
        { success: true, category: data },
        { headers: corsHeaders },
      );
    }

    if (body.action === 'create_unit') {
      const name = String(body.name || '').trim();
      const symbol = String(body.symbol || '').trim();
      const dimension = String(body.dimension || 'custom');
      const allowedDimensions = new Set([
        'mass',
        'volume',
        'count',
        'length',
        'custom',
      ]);
      if (!name || !symbol || !allowedDimensions.has(dimension)) {
        return NextResponse.json(
          { success: false, error: 'Invalid measurement unit' },
          { status: 400, headers: corsHeaders },
        );
      }
      const rawFactor = body.factor_to_canonical;
      const factor =
        rawFactor === null || rawFactor === undefined || rawFactor === ''
          ? null
          : Number(rawFactor);
      if (factor !== null && (!Number.isFinite(factor) || factor <= 0)) {
        return NextResponse.json(
          { success: false, error: 'Invalid unit conversion factor' },
          { status: 400, headers: corsHeaders },
        );
      }
      const { data, error } = await supabase
        .from('measurement_units')
        .insert({
          brand_id: brandId,
          code: `custom-${crypto.randomUUID()}`,
          name,
          symbol,
          dimension,
          factor_to_canonical: factor,
          is_system: false,
        })
        .select(
          'id, brand_id, code, name, symbol, dimension, factor_to_canonical, is_system',
        )
        .single();
      if (error) throw error;
      return NextResponse.json(
        { success: true, unit: data },
        { headers: corsHeaders },
      );
    }

    if (body.action === 'add_ingredient_unit') {
      const conversion = Number(body.conversion_to_base);
      if (
        !body.ingredient_id ||
        !body.unit_id ||
        !Number.isFinite(conversion) ||
        conversion <= 0
      ) {
        return NextResponse.json(
          { success: false, error: 'Invalid ingredient unit conversion' },
          { status: 400, headers: corsHeaders },
        );
      }

      const [{ data: ingredient, error: ingredientError }, {
        data: unit,
        error: unitError,
      }] = await Promise.all([
        supabase
          .from('ingredients')
          .select('id')
          .eq('id', body.ingredient_id)
          .eq('brand_id', brandId)
          .eq('is_active', true)
          .maybeSingle(),
        supabase
          .from('measurement_units')
          .select('id, name')
          .eq('id', body.unit_id)
          .eq('is_active', true)
          .maybeSingle(),
      ]);
      if (ingredientError) throw ingredientError;
      if (unitError) throw unitError;
      if (!ingredient || !unit) {
        return NextResponse.json(
          { success: false, error: 'Ingredient or unit not found' },
          { status: 404, headers: corsHeaders },
        );
      }

      const { data: existing, error: existingError } = await supabase
        .from('ingredient_units')
        .select('id')
        .eq('ingredient_id', ingredient.id)
        .eq('unit_id', unit.id)
        .maybeSingle();
      if (existingError) throw existingError;

      const payload = {
        ingredient_id: ingredient.id,
        unit_id: unit.id,
        unit_name: unit.name,
        conversion_to_base: conversion,
        is_default_purchase_unit: body.is_default_purchase_unit === true,
        updated_at: new Date().toISOString(),
      };
      const result = existing
        ? await supabase
            .from('ingredient_units')
            .update(payload)
            .eq('id', existing.id)
            .select()
            .single()
        : await supabase
            .from('ingredient_units')
            .insert(payload)
            .select()
            .single();
      if (result.error) throw result.error;

      return NextResponse.json(
        { success: true, ingredient_unit: result.data },
        { headers: corsHeaders },
      );
    }

    if (body.action === 'receive_batch') {
      const items = Array.isArray(body.items) ? body.items : [];
      if (items.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Receipt must contain at least one item' },
          { status: 400, headers: corsHeaders },
        );
      }
      const { data: receiptId, error } = await supabase.rpc(
        'receive_ingredient_batch',
        {
          p_invoice_number: String(body.invoice_number || '').trim() || null,
          p_supplier_name: String(body.supplier_name || '').trim() || null,
          p_received_at: body.received_at || new Date().toISOString(),
          p_note: String(body.note || '').trim() || null,
          p_items: items.map((item: any) => ({
            ingredient_id: item.ingredient_id,
            unit_id: item.unit_id || null,
            purchase_quantity: Number(item.purchase_quantity),
            conversion_to_base: Number(item.conversion_to_base),
            unit_cost:
              item.unit_cost === null ||
              item.unit_cost === undefined ||
              item.unit_cost === ''
                ? null
                : Number(item.unit_cost),
          })),
        },
      );
      if (error) throw error;
      return NextResponse.json(
        { success: true, receipt_id: receiptId },
        { headers: corsHeaders },
      );
    }

    if (body.action === 'adjust') {
      const quantityDelta = Number(body.quantity_delta);
      const allowedTypes = new Set([
        'RECEIVE',
        'ADJUST_IN',
        'ADJUST_OUT',
        'WASTE',
      ]);
      if (
        !body.ingredient_id ||
        !Number.isFinite(quantityDelta) ||
        quantityDelta === 0 ||
        !allowedTypes.has(body.movement_type)
      ) {
        return NextResponse.json(
          { success: false, error: 'Invalid stock adjustment' },
          { status: 400, headers: corsHeaders },
        );
      }

      const movementType = String(body.movement_type);
      const signedQuantity =
        ['ADJUST_OUT', 'WASTE'].includes(movementType)
          ? -Math.abs(quantityDelta)
          : Math.abs(quantityDelta);
      const eventId = crypto.randomUUID();
      const { data, error } = await supabase
        .from('ingredient_stock_movements')
        .insert({
          brand_id: brandId,
          ingredient_id: body.ingredient_id,
          quantity_delta: signedQuantity,
          movement_type: movementType,
          source_event_key: `MANUAL:${eventId}`,
          performed_by: userId,
          note: body.note || null,
        })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json(
        { success: true, movement: data },
        { headers: corsHeaders },
      );
    }

    if (!String(body.name || '').trim() || !body.base_unit_id) {
      return NextResponse.json(
        { success: false, error: 'Name and base_unit_id are required' },
        { status: 400, headers: corsHeaders },
      );
    }

    const units = Array.isArray(body.units)
      ? body.units
          .filter(
            (unit: any) =>
              String(unit.unit_id || '').trim() &&
              Number(unit.conversion_to_base) > 0,
          )
          .map((unit: any) => ({
            unit_id: unit.unit_id,
            conversion_to_base: Number(unit.conversion_to_base),
            purchase_price:
              unit.purchase_price === null ||
              unit.purchase_price === undefined ||
              unit.purchase_price === ''
                ? null
                : Number(unit.purchase_price),
            is_default_purchase_unit:
              unit.is_default_purchase_unit === true,
          }))
      : [];

    const { data: ingredientId, error: ingredientError } = await supabase.rpc(
      'create_ingredient_with_units',
      {
        p_name: String(body.name).trim(),
        p_sku: String(body.sku || '').trim(),
        p_category_id: body.category_id || null,
        p_base_unit_id: body.base_unit_id,
        p_minimum_stock: Number(body.minimum_stock || 0),
        p_allow_negative: body.allow_negative ?? true,
        p_units: units,
      },
    );
    if (ingredientError) throw ingredientError;

    return NextResponse.json(
      { success: true, ingredient_id: ingredientId },
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

export async function PATCH(request: Request) {
  try {
    const { supabase, brandId } = await getContext(request);
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Ingredient id is required' },
        { status: 400, headers: corsHeaders },
      );
    }

    const allowedFields = [
      'name',
      'sku',
      'category',
      'base_unit',
      'minimum_stock',
      'allow_negative',
      'is_active',
    ];
    const updates = Object.fromEntries(
      allowedFields
        .filter((key) => body[key] !== undefined)
        .map((key) => [key, body[key]]),
    );
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('ingredients')
      .update(updates)
      .eq('id', body.id)
      .eq('brand_id', brandId)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json(
      { success: true, ingredient: data },
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
