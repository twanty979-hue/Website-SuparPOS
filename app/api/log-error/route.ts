// app/api/log-error/route.ts
// API สำหรับรับข้อผิดพลาดจากแอปพลิเคชัน (Flutter) และเซิร์ฟเวอร์ บันทึกลง app_error_logs

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

const getSupabaseAdmin = () => {
  return createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      error_source = 'APP', // 'APP' หรือ 'API'
      error_name,
      error_message,
      stack_trace,
      screen_name,
      endpoint,
      status_code,
      brand_id,
      user_id,
      user_email,
      app_version = '2.1.1',
      platform,
      device_info,
      request_payload,
    } = body;

    // กรอง: บันทึกเฉพาะเมื่อมี error_message จริงเท่านั้น
    if (!error_message || typeof error_message !== 'string' || error_message.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'error_message is required' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const supabase = getSupabaseAdmin();

    const newLog = {
      error_source: error_source === 'API' ? 'API' : 'APP',
      error_name: error_name ? String(error_name).slice(0, 150) : null,
      error_message: String(error_message).slice(0, 5000),
      stack_trace: stack_trace ? String(stack_trace).slice(0, 10000) : null,
      screen_name: screen_name ? String(screen_name).slice(0, 100) : null,
      endpoint: endpoint ? String(endpoint).slice(0, 255) : null,
      status_code: typeof status_code === 'number' ? status_code : null,
      brand_id: brand_id || null,
      user_id: user_id || null,
      user_email: user_email || null,
      app_version: app_version ? String(app_version).slice(0, 50) : '2.1.1',
      platform: platform ? String(platform).slice(0, 50) : 'unknown',
      device_info: typeof device_info === 'object' && device_info !== null ? device_info : {},
      request_payload: typeof request_payload === 'object' && request_payload !== null ? request_payload : null,
      is_resolved: false,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('app_error_logs')
      .insert(newLog)
      .select('id')
      .single();

    if (error) {
      console.error('[LogError API] Insert error:', error.message);
      return NextResponse.json(
        {
          success: false,
          needsMigration: true,
          error: error.message,
        },
        { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return NextResponse.json(
      { success: true, log_id: data?.id },
      { status: 201, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (err: any) {
    console.error('[LogError API] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
