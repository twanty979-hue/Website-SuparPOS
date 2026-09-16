import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

const CDN_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://img.pos-foodscan.com";

const resolveImageUrl = (img: string | null | undefined): string | null => {
  if (!img) return null;
  const trimmed = String(img).trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  return `${CDN_URL}/${trimmed.replace(/^\/+/, '')}`;
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');

    if (!brandId) {
      return NextResponse.json({ success: false, error: 'Brand ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 1. Fetch brand details
    const { data: brand } = await supabase
      .from('brands')
      .select('id, name, logo_url, plan, status, phone')
      .eq('id', brandId)
      .maybeSingle();

    // 2. Fetch categories for this brand
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('brand_id', brandId)
      .order('sort_order', { ascending: true });

    // 3. Fetch products for this brand (excluding soft deleted)
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (prodError) throw prodError;

    // Map category name and resolved image URL to products
    const categoryMap = new Map((categories || []).map(c => [c.id, c.name]));
    const enrichedProducts = (products || []).map(p => {
      const rawImg = p.image_url || p.image_name;
      const resolvedImg = resolveImageUrl(rawImg);

      return {
        ...p,
        image_url: resolvedImg,
        image_name: resolvedImg,
        category_name: p.category_id ? (categoryMap.get(p.category_id) || 'ไม่ระบุหมวดหมู่') : 'ทั่วไป',
      };
    });

    const response = NextResponse.json({
      success: true,
      brand: brand ? {
        ...brand,
        logo_url: resolveImageUrl(brand.logo_url),
      } : null,
      categories: categories || [],
      products: enrichedProducts,
      total_count: enrichedProducts.length,
    });

    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  } catch (error: any) {
    console.error('❌ [Admin Brand Products Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
