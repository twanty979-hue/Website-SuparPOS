import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET() {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('id', 'global')
      .maybeSingle();

    if (error) {
      console.error('Fetch anonymous app status error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Default response if table is not yet migrated or empty.
    // Keep every module enabled by default so an older database never hides
    // a feature unintentionally.
    const defaultSettings = {
      maintenance_mode: false,
      maintenance_message: 'ระบบปิดปรับปรุงชั่วคราวเพื่อพัฒนาการบริการ คาดว่าจะเปิดให้บริการได้ปกติเร็วๆ นี้',
      force_update: false,
      latest_version: '1.0.0',
      android_min_version: '1.0.0',
      ios_min_version: '1.0.0',
      update_url: '',
      marketplace_enabled: true,
      modules: {
        pos: true,
        kitchen: true,
        receipt_history: true,
        inventory: true,
        dashboard: true,
        products: true,
        discounts: true,
        staff: true,
        tables: true,
        store_settings: true,
        themes: true,
        marketplace: true,
      },
    };
    const settings = {
      ...defaultSettings,
      ...(data || {}),
      modules: {
        ...defaultSettings.modules,
        marketplace: data?.marketplace_enabled !== false,
      },
    };

    return NextResponse.json(
      { success: true, settings },
      { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
