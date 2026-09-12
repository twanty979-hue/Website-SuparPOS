// app/api/tables/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 🌐 จัดการ CORS สำหรับฝั่ง Mobile
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// 🔐 Helper: แกะ Token หา brand_id ของพนักงาน
const makeTableToken = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const makeTokenBatch = (count: number) => {
  const safeCount = Math.max(1, Math.min(50, Math.floor(Number(count) || 1)));
  const tokens = new Set<string>();
  while (tokens.size < safeCount) tokens.add(makeTableToken());
  return Array.from(tokens);
};

function calculateEffectivePlan(brand: any) {
  const now = new Date();
  const isActive = (val: string | null) => {
    if (!val) return false;
    const d = new Date(val.replace(' ', 'T'));
    return !isNaN(d.getTime()) && d > now;
  };

  if (brand?.plan === 'ultimate' && isActive(brand.expiry_ultimate)) return 'ultimate';
  if (brand?.plan === 'pro' && isActive(brand.expiry_pro)) return 'pro';
  if (brand?.plan === 'basic' && isActive(brand.expiry_basic)) return 'basic';
  return 'free';
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
    .select('brand_id, brands(timezone, plan, expiry_basic, expiry_pro, expiry_ultimate)')
    .eq('id', user.id)
    .single();

  if (!profile?.brand_id) throw new Error('No brand assigned');
  const brand = (profile as any).brands;
  const effectivePlan = calculateEffectivePlan(brand);
  return { supabase, brandId: profile.brand_id, effectivePlan };
};

// --- 📥 [GET] ดึงข้อมูลโต๊ะของร้านตัวเอง ---
export async function GET(request: Request) {
  try {
    const { supabase, brandId, effectivePlan } = await getSupabaseAndBrandId(request);

    const { data: tables, error } = await supabase
      .from('tables')
      .select('*')
      .eq('brand_id', brandId)
      .eq('is_active', true)
      .order('label', { ascending: true });

    if (error) throw error;

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: sysSettings } = await adminClient
      .from('system_settings')
      .select('dashboard_permissions')
      .eq('id', 'global')
      .maybeSingle();

    const rawPerms = sysSettings?.dashboard_permissions?.[effectivePlan] || {};
    const maxTables = Number(rawPerms.max_tables ?? (effectivePlan === 'free' ? 10 : 0));

    return NextResponse.json({ 
      success: true, 
      data: tables || [],
      max_tables: maxTables,
      total_count: tables?.length || 0,
      effective_plan: effectivePlan
    }, {
      status: 200, headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}

// --- 📤 [POST] สร้างโต๊ะใหม่ หรือ อัปเดตข้อมูล (เปลี่ยน Passcode) ---
export async function POST(request: Request) {
  try {
    const { supabase, brandId, effectivePlan } = await getSupabaseAndBrandId(request);
    const body = await request.json();
    const { id, label, capacity, status, access_token, action, count } = body;

    if (!id && action !== 'generate_tokens') {
      // ตรวจสอบโควตาจำนวนโต๊ะสูงสุดตามแพ็กเกจ
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: sysSettings } = await adminClient
        .from('system_settings')
        .select('dashboard_permissions')
        .eq('id', 'global')
        .maybeSingle();

      const rawPerms = sysSettings?.dashboard_permissions?.[effectivePlan] || {};
      const maxTables = Number(rawPerms.max_tables ?? (effectivePlan === 'free' ? 10 : 0));

      if (maxTables > 0) {
        const { count: tableCount, error: countError } = await adminClient
          .from('tables')
          .select('id', { count: 'exact', head: true })
          .eq('brand_id', brandId)
          .eq('is_active', true);

        if (!countError && (tableCount ?? 0) >= maxTables) {
          return NextResponse.json(
            {
              success: false,
              error: `จำนวนโต๊ะเกินขีดจำกัดของแพ็กเกจ (สูงสุด ${maxTables} โต๊ะ) กรุณาอัปเกรดแพ็กเกจ`,
            },
            { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } }
          );
        }
      }
    }

    if (action === 'generate_tokens') {
      if (!id) return NextResponse.json({ success: false, error: 'Missing table id' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
      const tokens = makeTokenBatch(count);
      const { data, error } = await supabase
        .from('tables')
        .update({ access_token: tokens[0], access_tokens: tokens, status: 'available' })
        .eq('id', id)
        .eq('brand_id', brandId)
        .select('*')
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, tokens, data }, { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    if (!label) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุชื่อโต๊ะ' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const tablePayload: any = {
      brand_id: brandId,
      label: label.trim(),
      capacity: capacity !== undefined ? Number(capacity) : 4,
      status: status || 'available',
    };

    // ถ้ารับ access_token (Passcode) มาจากหน้าบ้าน ให้เซฟทับด้วย
    if (access_token) {
      tablePayload.access_token = access_token;
      tablePayload.access_tokens = [access_token];
    }

    if (id) {
      const { data, error } = await supabase
        .from('tables').update(tablePayload).eq('id', id).eq('brand_id', brandId).select().single();
      if (error) throw error;
      return NextResponse.json({ success: true, message: 'อัปเดตข้อมูลสำเร็จ', data }, { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
    } else {
      // โหมดสร้างใหม่: ถ้าไม่ได้ส่ง Passcode มา ให้เจนเลข 4 หลักสุ่มให้
      if (!tablePayload.access_token) {
        tablePayload.access_token = makeTableToken();
        tablePayload.access_tokens = [tablePayload.access_token];
      }
      const { data, error } = await supabase
        .from('tables').insert([tablePayload]).select().single();
      if (error) throw error;
      return NextResponse.json({ success: true, message: 'เพิ่มโต๊ะใหม่สำเร็จ', data }, { status: 201, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}

// --- ❌ [DELETE] ลบโต๊ะ (Soft Delete) ---
export async function DELETE(request: Request) {
  try {
    const { supabase, brandId } = await getSupabaseAndBrandId(request);
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get('id');

    if (!tableId) return NextResponse.json({ success: false, error: 'กรุณาระบุไอดีโต๊ะ' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });

    const { error } = await supabase
      .from('tables').update({ is_active: false }).eq('id', tableId).eq('brand_id', brandId);

    if (error) throw error;
    return NextResponse.json({ success: true, message: 'ลบโต๊ะสำเร็จ' }, { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}