import admin from 'firebase-admin';
import { getFirebaseAdmin } from './firebaseAdmin';
import { getSupabaseAdmin } from './supabaseServer';

type ProfilePushOptions = {
  profileIds: string[];
  title: string;
  message: string;
  type: string;
  data?: Record<string, string>;
};

export async function sendProfilePush({
  profileIds,
  title,
  message,
  type,
  data = {},
}: ProfilePushOptions) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const uniqueProfileIds = [...new Set(profileIds.filter(Boolean))];
    if (uniqueProfileIds.length === 0) return { success: false, reason: 'no_recipients' };

    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('fcm_token, fcm_token_web')
      .in('id', uniqueProfileIds);

    if (error) throw error;

    const tokens = [
      ...new Set(
        (profiles || [])
          .flatMap((profile) => [profile.fcm_token, profile.fcm_token_web])
          .filter(Boolean) as string[],
      ),
    ];

    if (tokens.length === 0) return { success: false, reason: 'no_tokens' };

    const response = await getFirebaseAdmin().messaging().sendEachForMulticast({
      tokens,
      notification: { title, body: message },
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
      webpush: { notification: { title, body: message } },
      data: {
        title,
        body: message,
        type,
        ...data,
      },
    });

    return {
      success: response.successCount > 0,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error('Failed to send profile push notification:', error);
    return { success: false, reason: 'send_failed' };
  }
}
