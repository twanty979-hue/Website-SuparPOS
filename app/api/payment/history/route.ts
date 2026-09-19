import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthContext } from '@/lib/authHelper';

export async function GET(request: Request) {
  try {
    const { supabase, brandId: myBrandId } = await getAuthContext(request);

    // 4. 🚀 ยิงคิวรี่ขนานพร้อมกัน 2 ตาราง (Parallel Fetching) รวดเร็วทันใจ
    const [paymentsResponse, coinsResponse] = await Promise.all([
      supabase.from('payment_logs').select('*').eq('brand_id', myBrandId).order('created_at', { ascending: false }),
      supabase.from('coin_logs').select('*').eq('brand_id', myBrandId).order('created_at', { ascending: false })
    ]);

    if (paymentsResponse.error) throw paymentsResponse.error;
    if (coinsResponse.error) throw coinsResponse.error;

    // 5. ส่งแพ็กเกจคู่กลับไปให้แอป Flutter ดึงค่าไปกระจายแสดงผล
    return NextResponse.json({
      success: true,
      payments: paymentsResponse.data ?? [],
      coins: coinsResponse.data ?? []
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}