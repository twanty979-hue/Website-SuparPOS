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

export async function POST(request: Request) {
  try {
    const { title, body } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ success: false, error: 'กรุณากรอกหัวข้อและข้อความแจ้งเตือน' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 1. Fetch all profiles with FCM tokens
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('fcm_token, fcm_token_web');

    if (error) {
      console.error('Fetch tokens error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // 2. Collect unique tokens
    const tokensSet = new Set<string>();
    profiles?.forEach(p => {
      if (p.fcm_token) tokensSet.add(p.fcm_token);
      if (p.fcm_token_web) tokensSet.add(p.fcm_token_web);
    });

    const tokens = Array.from(tokensSet);

    if (tokens.length === 0) {
      return NextResponse.json({ 
        success: true, 
        sentCount: 0, 
        message: 'ไม่พบอุปกรณ์ที่ลงทะเบียนรับแจ้งเตือนในระบบ (FCM tokens)' 
      });
    }

    // 3. Send FCM multicast in batches of 500
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < tokens.length; i += 500) {
      const batch = tokens.slice(i, i + 500);
      const response = await getFirebaseAdmin().messaging().sendEachForMulticast({
        tokens: batch,
        notification: { title, body },
        android: {
          priority: 'high',
          notification: {
            channelId: 'general_notifications',
            priority: 'high',
            sound: 'default',
            defaultVibrateTimings: true,
          },
        },
        apns: { payload: { aps: { sound: 'default' } } },
        webpush: { notification: { title, body } },
        data: {
          title,
          body,
          type: 'broadcast_news',
        },
      });

      successCount += response.successCount;
      failureCount += response.failureCount;
    }

    return NextResponse.json({
      success: true,
      sentCount: tokens.length,
      successCount,
      failureCount,
      message: `ส่งการแจ้งเตือนบรอดแคสต์เสร็จสิ้น สำเร็จ ${successCount} เครื่อง, ล้มเหลว ${failureCount} เครื่อง`
    });
  } catch (err: any) {
    console.error('Broadcast push error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
