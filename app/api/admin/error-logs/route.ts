// app/api/admin/error-logs/route.ts
// API สำหรับผู้ดูแลระบบ (Admin) เพื่อดู, กรอง, และจัดการสถานะข้อผิดพลาด

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getSupabaseAdmin = () => {
  return createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '30', 10)));
    const source = searchParams.get('source'); // 'APP', 'API', or undefined/all
    const brandId = searchParams.get('brand_id');
    const resolved = searchParams.get('resolved'); // 'UNRESOLVED', 'RESOLVED', or 'ALL'
    const q = searchParams.get('q')?.trim();

    const supabase = getSupabaseAdmin();

    // 1. ตรวจสอบตารางมีอยู่หรือไม่
    let query = supabase
      .from('app_error_logs')
      .select(`
        id,
        error_source,
        error_name,
        error_message,
        stack_trace,
        screen_name,
        endpoint,
        status_code,
        brand_id,
        user_id,
        user_email,
        app_version,
        platform,
        device_info,
        request_payload,
        is_resolved,
        resolved_at,
        created_at,
        brands (
          id,
          name,
          logo_url
        )
      `, { count: 'exact' });

    // ตัวกรอง
    if (source && (source === 'APP' || source === 'API')) {
      query = query.eq('error_source', source);
    }

    if (brandId && brandId !== 'ALL') {
      query = query.eq('brand_id', brandId);
    }

    if (resolved === 'UNRESOLVED') {
      query = query.eq('is_resolved', false);
    } else if (resolved === 'RESOLVED') {
      query = query.eq('is_resolved', true);
    }

    if (q) {
      query = query.or(`error_message.ilike.%${q}%,screen_name.ilike.%${q}%,endpoint.ilike.%${q}%,error_name.ilike.%${q}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: logs, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      if (error.code === '42P01') {
        // Table does not exist
        return NextResponse.json({
          success: false,
          needsMigration: true,
          error: 'ตาราง app_error_logs ยังไม่ได้ถูกสร้างในฐานข้อมูล กรุณารัน SQL Migration'
        }, { status: 404 });
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // 2. ดึงสถิติภาพรวม (Stats)
    const [totalRes, appRes, apiRes, unresolvedRes] = await Promise.all([
      supabase.from('app_error_logs').select('id', { count: 'exact', head: true }),
      supabase.from('app_error_logs').select('id', { count: 'exact', head: true }).eq('error_source', 'APP'),
      supabase.from('app_error_logs').select('id', { count: 'exact', head: true }).eq('error_source', 'API'),
      supabase.from('app_error_logs').select('id', { count: 'exact', head: true }).eq('is_resolved', false),
    ]);

    // 3. ดึงรายชื่อร้านค้าทั้งหมดสำหรับตัวเลือก Filter Dropdown
    const { data: brandsList } = await supabase
      .from('brands')
      .select('id, name')
      .order('name', { ascending: true });

    return NextResponse.json({
      success: true,
      data: logs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      stats: {
        total: totalRes.count || 0,
        app: appRes.count || 0,
        api: apiRes.count || 0,
        unresolved: unresolvedRes.count || 0
      },
      brands: brandsList || []
    });
  } catch (err: any) {
    console.error('[Admin ErrorLogs API] GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// อัปเดตสถานะ (แก้แล้ว / ยังไม่แก้)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, is_resolved } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('app_error_logs')
      .update({
        is_resolved: Boolean(is_resolved),
        resolved_at: is_resolved ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ลบรายการข้อผิดพลาด
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const clearAll = searchParams.get('clear_all') === 'true';

    const supabase = getSupabaseAdmin();

    if (clearAll) {
      const { error } = await supabase.from('app_error_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, message: 'ล้างข้อมูลข้อผิดพลาดทั้งหมดเรียบร้อยแล้ว' });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabase.from('app_error_logs').delete().eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, message: 'ลบรายการข้อผิดพลาดเรียบร้อยแล้ว' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
