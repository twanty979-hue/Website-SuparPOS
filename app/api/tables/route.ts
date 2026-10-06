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
  if (brand?.plan === 'go' && isActive(brand.expiry_go)) return 'go';
  return 'free';
}

import { getAuthContext } from '@/lib/authHelper';

const getSupabaseAndBrandId = async (request: Request, body?: any) => {
  return getAuthContext(request, body);
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

    const rawTables = tables || [];
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

    return NextResponse.json({ 
      success: true, 
      data: formattedTables,
      max_tables: maxTables,
      locked_table_count: lockedTableCount,
      total_count: rawTables.length,
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
    const incomingTables = Array.isArray(body.tables) ? body.tables : null;
    const isBatch = Boolean(incomingTables && incomingTables.length > 0);

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

        const currentCount = tableCount ?? 0;
        const addCount = isBatch ? incomingTables.length : 1;

        if (!countError && currentCount + addCount > maxTables) {
          return NextResponse.json(
            {
              success: false,
              error: `จำนวนโต๊ะเกินขีดจำกัดของแพ็กเกจ (ปัจจุบันมี ${currentCount} โต๊ะ, ไม่สามารถเพิ่มอีก ${addCount} โต๊ะได้เนื่องจากจำกัดสูงสุด ${maxTables} โต๊ะ) กรุณาอัปเกรดแพ็กเกจ`,
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

    // 🚀 โหมดเพิ่มทีละหลายโต๊ะ (Batch Insert)
    if (isBatch) {
      const rowsToInsert = incomingTables.map((item: any) => {
        const itemLabel = typeof item === 'string' ? item : (item.label || '');
        const itemToken = (typeof item === 'object' && item.access_token) ? item.access_token : makeTableToken();
        const itemCap = (typeof item === 'object' && item.capacity !== undefined) ? Number(item.capacity) : 4;
        return {
          brand_id: brandId,
          label: itemLabel.toString().trim(),
          capacity: itemCap,
          status: 'available',
          access_token: itemToken,
          access_tokens: [itemToken],
        };
      }).filter((r: any) => r.label.length > 0);

      if (rowsToInsert.length === 0) {
        return NextResponse.json({ success: false, error: 'กรุณาระบุชื่อโต๊ะอย่างน้อย 1 โต๊ะ' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
      }

      const { data, error } = await supabase
        .from('tables')
        .insert(rowsToInsert)
        .select('*');

      if (error) throw error;
      return NextResponse.json(
        { success: true, message: `เพิ่มโต๊ะใหม่สำเร็จ ${rowsToInsert.length} โต๊ะ`, data, count: rowsToInsert.length },
        { status: 201, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
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

// --- ❌ [DELETE] ลบโต๊ะ (Smart Delete: ลบถาวรถ้าไม่มีออเดอร์ / ปิดการใช้งานถ้ามีประวัติบิล) ---
export async function DELETE(request: Request) {
  try {
    const { supabase, brandId } = await getSupabaseAndBrandId(request);
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get('id');

    if (!tableId) return NextResponse.json({ success: false, error: 'กรุณาระบุไอดีโต๊ะ' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });

    // ตรวจสอบว่าโต๊ะนี้มีประวัติออเดอร์ผูกอยู่หรือไม่
    const { count: orderCount } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('table_id', tableId);

    if (!orderCount || orderCount === 0) {
      // โต๊ะที่ไม่มีประวัติออเดอร์ -> ลบออกจากฐานข้อมูลจริงถาวร (Hard Delete)
      const { error: delError } = await supabase
        .from('tables')
        .delete()
        .eq('id', tableId)
        .eq('brand_id', brandId);
      if (delError) throw delError;
    } else {
      // โต๊ะที่เคยมีออเดอร์แล้ว -> ปิดใช้งาน (Soft Delete) เพื่อรักษาประวัติการเงินและใบเสร็จย้อนหลัง
      const { error: updateError } = await supabase
        .from('tables')
        .update({ is_active: false })
        .eq('id', tableId)
        .eq('brand_id', brandId);
      if (updateError) throw updateError;
    }

    return NextResponse.json({ success: true, message: 'ลบโต๊ะสำเร็จ' }, { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}