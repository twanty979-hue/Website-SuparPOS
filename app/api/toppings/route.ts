import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

const getSupabaseAndBrandId = async (request: Request) => {
  const authHeader = request.headers.get('authorization');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader || '' } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('brand_id')
    .eq('id', user.id)
    .single();

  if (!profile?.brand_id) throw new Error('No brand assigned');
  return { supabase, brandId: profile.brand_id };
};

const formatGroups = (groups: any[] = [], items: any[] = []) =>
  groups.map((group: any) => ({
    ...group,
    choices: items
      .filter((item: any) => String(item.group_id) === String(group.id))
      .sort((a: any, b: any) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
      .map((item: any) => ({
        id: item.id,
        name: item.name,
        image_name: item.image_name || null,
        image_url: item.image_name || null,
        price: Number(item.price || 0),
        is_active: item.is_active !== false,
        sort_order: item.sort_order || 0,
      })),
  }));

export async function GET(request: Request) {
  try {
    const { supabase, brandId } = await getSupabaseAndBrandId(request);

    const [groupsRes, itemsRes] = await Promise.all([
      supabase
        .from('topping_groups')
        .select('*')
        .eq('brand_id', brandId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('topping_items')
        .select('*')
        .eq('brand_id', brandId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
    ]);

    if (groupsRes.error) throw groupsRes.error;
    if (itemsRes.error) throw itemsRes.error;

    return NextResponse.json(
      { success: true, groups: formatGroups(groupsRes.data || [], itemsRes.data || []) },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(
      { success: false, error: error.message },
      { status, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, brandId } = await getSupabaseAndBrandId(request);
    const body = await request.json();
    const action = body.action || 'upsert_group';

    if (action === 'assign_product') {
      const productId = body.product_id;
      const groupIds = Array.isArray(body.group_ids) ? body.group_ids : [];
      if (!productId) throw new Error('Missing product_id');

      await supabase
        .from('product_topping_groups')
        .delete()
        .eq('brand_id', brandId)
        .eq('product_id', productId);

      const rows = groupIds.filter(Boolean).map((groupId: string) => ({
        brand_id: brandId,
        product_id: productId,
        group_id: groupId,
      }));

      if (rows.length > 0) {
        const { error } = await supabase
          .from('product_topping_groups')
          .insert(rows);
        if (error) throw error;
      }

      return NextResponse.json(
        { success: true },
        { headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    if (action === 'delete_group') {
      if (!body.id) throw new Error('Missing topping group id');
      const { error } = await supabase
        .from('topping_groups')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('brand_id', brandId)
        .eq('id', body.id);
      if (error) throw error;
      return NextResponse.json(
        { success: true },
        { headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const group = body.group || body;
    const choices = Array.isArray(group.choices) ? group.choices : [];
    const groupPayload = {
      brand_id: brandId,
      name: String(group.name || '').trim(),
      type: group.type === 'single' ? 'single' : 'multiple',
      required: Boolean(group.required),
      is_active: group.is_active !== false,
      sort_order: Number(group.sort_order || 0),
      updated_at: new Date().toISOString(),
    };

    if (!groupPayload.name) throw new Error('Missing topping group name');

    const groupQuery = group.id
      ? supabase
          .from('topping_groups')
          .update(groupPayload)
          .eq('brand_id', brandId)
          .eq('id', group.id)
          .select()
          .single()
      : supabase
          .from('topping_groups')
          .insert([{ ...groupPayload, created_at: new Date().toISOString() }])
          .select()
          .single();

    const { data: savedGroup, error: groupError } = await groupQuery;
    if (groupError) throw groupError;

    if (group.id) {
      const { error: inactiveError } = await supabase
        .from('topping_items')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('brand_id', brandId)
        .eq('group_id', savedGroup.id);
      if (inactiveError) throw inactiveError;
    }

    for (const [index, choice] of choices.entries()) {
      const name = String(choice.name || '').trim();
      if (!name) continue;
      const itemPayload = {
        brand_id: brandId,
        group_id: savedGroup.id,
        name,
        image_name: choice.image_name || null,
        price: Number(choice.price || 0),
        is_active: choice.is_active !== false,
        sort_order: Number(choice.sort_order ?? index),
        updated_at: new Date().toISOString(),
      };

      const { error } = choice.id
        ? await supabase
            .from('topping_items')
            .update(itemPayload)
            .eq('brand_id', brandId)
            .eq('id', choice.id)
        : await supabase
            .from('topping_items')
            .insert([{ ...itemPayload, created_at: new Date().toISOString() }]);
      if (error) throw error;
    }

    const { data: refreshedItems, error: itemsError } = await supabase
      .from('topping_items')
      .select('*')
      .eq('brand_id', brandId)
      .eq('group_id', savedGroup.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (itemsError) throw itemsError;

    return NextResponse.json(
      {
        success: true,
        group: formatGroups([savedGroup], refreshedItems || [])[0],
      },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(
      { success: false, error: error.message },
      { status, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
