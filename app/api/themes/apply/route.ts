// app/api/themes/apply/route.ts
import { NextResponse } from 'next/server';
import dayjs from 'dayjs';
import { getAuthContext, corsHeaders, handleCorsOptions } from '@/lib/authHelper';

const PURCHASED_THEME_TYPES = ['free', 'weekly', 'monthly', 'yearly', 'lifetime'];

export async function OPTIONS() {
  return handleCorsOptions();
}

// 📥 [POST] เปิดใช้งานธีมใหม่ลงระบบร้านค้า
export async function POST(request: Request) {
  try {
    const { supabase, brandId, isOwner } = await getAuthContext(request);

    // 🔒 ล็อกสิทธิ์ระวังภัยขั้นสูงสุด
    if (!isOwner) {
      return NextResponse.json({ success: false, error: 'Permission denied. Only owners can change themes.' }, { status: 403, headers: corsHeaders });
    }

    const body = await request.json();
    const { slug, themeMode } = body;

    if (!slug || !themeMode) {
      return NextResponse.json({ success: false, error: 'Missing slug or themeMode' }, { status: 400, headers: corsHeaders });
    }

    // ตรวจเช็คความปลอดภัยว่าแบรนด์นี้ถือครองสิทธิ์ธีมนี้จริง และยังไม่หมดอายุ
    if (themeMode !== 'standard') {
      const { data: targetTheme, error: checkError } = await supabase
        .from('themes')
        .select('expires_at, purchase_type, marketplace_themes!inner(theme_mode)')
        .eq('brand_id', brandId)
        .eq('marketplace_themes.theme_mode', themeMode)
        .in('purchase_type', PURCHASED_THEME_TYPES)
        .maybeSingle();

      if (checkError || !targetTheme) {
        const { data: freeTheme } = await supabase
          .from('marketplace_themes')
          .select('id')
          .eq('theme_mode', themeMode)
          .eq('is_active', true)
          .eq('min_plan', 'free')
          .maybeSingle();

        if (!freeTheme) {
          return NextResponse.json({ success: false, error: 'Theme not owned or matching database records' }, { status: 400, headers: corsHeaders });
        }
      } else {
        const isLifetime = targetTheme.purchase_type === 'lifetime';
        const isExpired = targetTheme.expires_at && dayjs(targetTheme.expires_at).isBefore(dayjs());
        
        if (!isLifetime && isExpired) {
          return NextResponse.json({ success: false, error: 'This theme has already expired' }, { status: 400, headers: corsHeaders });
        }
      }
    }

    // 🎉 สั่งอัปเดตสับเปลี่ยนดีไซน์ธีมลงตารางแบรนด์หลัก
    const { error: updateError } = await supabase
      .from('brands')
      .update({ 
        slug, 
        theme_mode: themeMode, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', brandId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, message: 'Theme applied successfully' }, { status: 200, headers: corsHeaders });

  } catch (error: any) {
    console.error("❌ [API] Theme Apply Error:", error);
    const status = error.message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status, headers: corsHeaders });
  }
}
