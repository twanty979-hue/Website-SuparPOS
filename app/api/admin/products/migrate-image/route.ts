import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const runtime = 'nodejs';
export const maxDuration = 60;

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const getSupabaseAdmin = () => {
  return createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
};

const R2_PUBLIC_URL = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://img.pos-foodscan.com').replace(/\/$/, '');
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'foodscan-images';

function getExtensionFromMime(mime: string): string {
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('png')) return 'png';
  if (mime.includes('gif')) return 'gif';
  if (mime.includes('svg')) return 'svg';
  return 'jpg';
}

// ── GET: ดึงสรุปสถานะรูปภาพทั้งหมด (กี่รูปเป็น Cloudflare, กี่รูปเป็นลิงก์นอก) ──
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    let rows: any[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('admin_product_master')
        .select('id, image_url')
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) throw error;
      if (data && data.length > 0) {
        rows = rows.concat(data);
        if (data.length < pageSize) {
          hasMore = false;
        } else {
          from += pageSize;
        }
      } else {
        hasMore = false;
      }
    }

    const total = rows.length;
    const externalIds: string[] = [];
    let onR2Count = 0;
    let noImageCount = 0;

    for (const r of rows) {
      const url = r.image_url?.trim() || '';
      if (!url) {
        noImageCount++;
      } else if (url.includes('img.pos-foodscan.com') || url.includes(R2_PUBLIC_URL)) {
        onR2Count++;
      } else {
        externalIds.push(r.id);
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total,
        on_r2: onR2Count,
        external: externalIds.length,
        no_image: noImageCount,
      },
      external_ids: externalIds,
      r2_public_url: R2_PUBLIC_URL,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ── POST: ย้ายรูปภาพจากลิงก์ภายนอกขึ้น Cloudflare R2 และอัปเดต URL ในฐานข้อมูล ──
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product_id, product_ids } = body;

    const idsToProcess: string[] = [];
    if (product_id) idsToProcess.push(String(product_id));
    if (Array.isArray(product_ids)) {
      product_ids.forEach((id: any) => {
        if (id && !idsToProcess.includes(String(id))) idsToProcess.push(String(id));
      });
    }

    if (idsToProcess.length === 0) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุ product_id หรือ product_ids' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: products, error: fetchErr } = await supabase
      .from('admin_product_master')
      .select('id, name, image_url')
      .in('id', idsToProcess);

    if (fetchErr) {
      return NextResponse.json({ success: false, error: fetchErr.message }, { status: 500 });
    }

    const results: any[] = [];

    for (const prod of products || []) {
      const currentUrl = prod.image_url?.trim();
      if (!currentUrl) {
        results.push({ id: prod.id, status: 'skipped', reason: 'no_image' });
        continue;
      }

      // ถ้าเป็นลิงก์ Cloudflare R2 ของเราอยู่แล้ว ให้ข้ามได้เลย
      if (currentUrl.includes('img.pos-foodscan.com') || currentUrl.includes(R2_PUBLIC_URL)) {
        results.push({ id: prod.id, status: 'already_migrated', url: currentUrl });
        continue;
      }

      try {
        let fetchUrl = currentUrl;
        let origin = '';
        try {
          origin = new URL(fetchUrl).origin;
        } catch (_) {}

        // ดาวน์โหลดรูปภาพจาก URL ภายนอก
        const imgRes = await fetch(fetchUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            ...(origin ? { 'Referer': origin } : {}),
          },
          signal: AbortSignal.timeout(15000),
        });

        if (!imgRes.ok) {
          throw new Error(`ดาวน์โหลดรูปไม่สำเร็จ (HTTP ${imgRes.status})`);
        }

        const arrayBuffer = await imgRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
        const ext = getExtensionFromMime(contentType);
        const fileKey = `master-products/${prod.id}_${Date.now()}.${ext}`;

        // อัปโหลดขึ้น Cloudflare R2
        const uploadCmd = new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: fileKey,
          Body: buffer,
          ContentType: contentType,
        });

        await s3Client.send(uploadCmd);

        const newImageUrl = `${R2_PUBLIC_URL}/${fileKey}`;

        // อัปเดตลิงก์ใหม่ลงตาราง admin_product_master
        const { error: updateErr } = await supabase
          .from('admin_product_master')
          .update({
            image_url: newImageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', prod.id);

        if (updateErr) throw updateErr;

        results.push({
          id: prod.id,
          status: 'success',
          old_url: currentUrl,
          new_url: newImageUrl,
        });
      } catch (err: any) {
        console.error(`[Migrate Image] Error for product ${prod.id}:`, err);
        results.push({
          id: prod.id,
          status: 'failed',
          error: err.message || 'Unknown error',
        });
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const skippedCount = results.filter(
      (r) => r.status === 'already_migrated' || r.status === 'skipped'
    ).length;
    const failedCount = results.filter((r) => r.status === 'failed').length;

    return NextResponse.json({
      success: true,
      summary: {
        total: idsToProcess.length,
        migrated: successCount,
        skipped: skippedCount,
        failed: failedCount,
      },
      results,
    });
  } catch (error: any) {
    console.error('[Migrate Image API] Fatal error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
