import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';

const getSupabaseAdmin = () => {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
};

// ── ยิง FCM data message ไปทุกเครื่องที่เปิดแอปอยู่ ────────────────────────
async function broadcastSystemStatus(settings: {
  maintenance_mode: boolean;
  maintenance_message: string;
  force_update: boolean;
  latest_version: string;
  update_url: string;
  marketplace_enabled: boolean;
}) {
  const supabase = getSupabaseAdmin();

  // ดึง FCM tokens จากตาราง profiles (เหมือนกับ broadcast-notification)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('fcm_token, fcm_token_web');

  const tokensSet = new Set<string>();
  profiles?.forEach((p: any) => {
    if (p.fcm_token) tokensSet.add(p.fcm_token);
    if (p.fcm_token_web) tokensSet.add(p.fcm_token_web);
  });

  const tokens = Array.from(tokensSet);
  if (tokens.length === 0) return;

  // ยิง data-only message (ไม่มี notification popup)
  // Flutter รับผ่าน onMessage.listen แล้วจัดการ UI เอง
  for (let i = 0; i < tokens.length; i += 500) {
    const batch = tokens.slice(i, i + 500);
    await getFirebaseAdmin().messaging().sendEachForMulticast({
      tokens: batch,
      data: {
        type: 'system_status',
        maintenance_mode: String(settings.maintenance_mode),
        maintenance_message: settings.maintenance_message,
        force_update: String(settings.force_update),
        latest_version: settings.latest_version,
        update_url: settings.update_url,
        marketplace_enabled: String(settings.marketplace_enabled),
      },
      android: { priority: 'high' },
      apns: { headers: { 'apns-priority': '10' } },
    }).catch(e => console.error('[FCM system_status] batch error:', e));
  }
}
// ─────────────────────────────────────────────────────────────────────────────


export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('id', 'global')
      .maybeSingle();

    if (error) {
      console.error('Fetch global settings error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!data) {
      const { data: inserted, error: insertError } = await supabase
        .from('system_settings')
        .insert({
          id: 'global',
          maintenance_mode: false,
          maintenance_message: 'ระบบปิดปรับปรุงชั่วคราวเพื่อพัฒนาการบริการ คาดว่าจะเปิดให้บริการได้ปกติเร็วๆ นี้',
          force_update: false,
          latest_version: '1.0.0',
          android_min_version: '1.0.0',
          ios_min_version: '1.0.0',
          update_url: '',
          marketplace_enabled: true,
        })
        .select('*')
        .single();

      if (insertError) {
        return NextResponse.json({
          success: false,
          needsMigration: true,
          error: 'Table system_settings does not exist. Please run the SQL migration script in your Supabase SQL Editor.',
        }, { status: 404 });
      }
      return NextResponse.json({ success: true, settings: inserted });
    }

    return NextResponse.json({ success: true, settings: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    const updateData: any = { updated_at: new Date().toISOString() };
    const allowedKeys = [
      'maintenance_mode',
      'maintenance_message',
      'force_update',
      'latest_version',
      'android_min_version',
      'ios_min_version',
      'update_url',
      'marketplace_enabled',
    ];

    allowedKeys.forEach(key => {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    });

    const { data, error } = await supabase
      .from('system_settings')
      .update(updateData)
      .eq('id', 'global')
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // ── ยิง FCM ทันทีเมื่อบันทึกสำเร็จ ─────────────────────────────────────
    // ทำ background (ไม่ await) เพื่อไม่ให้ admin รอนาน
    broadcastSystemStatus({
      maintenance_mode: data.maintenance_mode,
      maintenance_message: data.maintenance_message,
      force_update: data.force_update,
      latest_version: data.latest_version,
      update_url: data.update_url,
      marketplace_enabled: data.marketplace_enabled !== false,
    }).catch(e => console.error('[FCM system_status] broadcast error:', e));
    // ─────────────────────────────────────────────────────────────────────────

    return NextResponse.json({ success: true, settings: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
