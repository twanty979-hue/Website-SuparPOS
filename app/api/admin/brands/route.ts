import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

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
    const supabase = getSupabaseAdmin();

    // 1. Fetch brand reports from view (or fallback to brands table)
    let brandReports: any[] = [];
    const { data: viewData, error: viewError } = await supabase
      .from('brand_dashboard_report')
      .select('*')
      .order('created_at', { ascending: false });

    if (viewError) {
      console.warn('⚠️ Could not fetch from brand_dashboard_report, fallback to brands table:', viewError.message);
      const { data: brandsData, error: brandsError } = await supabase
        .from('brands')
        .select('*')
        .order('created_at', { ascending: false });
      if (brandsError) throw brandsError;
      brandReports = (brandsData || []).map(b => ({
        ...b,
        total_coins: b.coins || 0,
        current_theme: b.current_theme || 'default',
        total_banners: 0,
        total_categories: 0,
        total_tables: 0,
        total_discounts: 0,
        total_products: 0,
        total_orders: 0,
        today_orders: 0,
      }));
    } else {
      brandReports = viewData || [];
    }

    // 2. Fetch real-time exact product counts directly from products table (excluding deleted)
    const { data: realProducts } = await supabase
      .from('products')
      .select('brand_id')
      .is('deleted_at', null);

    const productCountMap = new Map<string, number>();
    (realProducts || []).forEach(p => {
      if (p.brand_id) {
        productCountMap.set(p.brand_id, (productCountMap.get(p.brand_id) || 0) + 1);
      }
    });

    // 3. Fetch profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, phone, avatar_url, role, brand_id, own_brand_id, created_at, updated_at');
    
    if (profileError) {
      console.warn('⚠️ Could not fetch profiles:', profileError.message);
    }

    // 4. Fetch Auth Users for emails & auth metadata
    const userEmailMap = new Map<string, { email?: string; last_sign_in_at?: string; created_at?: string }>();
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      if (!authError && authData?.users) {
        authData.users.forEach(u => {
          userEmailMap.set(u.id, {
            email: u.email,
            last_sign_in_at: u.last_sign_in_at,
            created_at: u.created_at,
          });
        });
      }
    } catch (authErr) {
      console.warn('⚠️ Could not fetch auth users:', authErr);
    }

    // 5. Map profiles and attach owner info + accurate real-time product count to each brand
    const profileList = profiles || [];

    const enrichedBrands = brandReports.map(brand => {
      const brandProfiles = profileList.filter(p => p.brand_id === brand.id || p.own_brand_id === brand.id);
      
      const ownerProfile = brandProfiles.find(p => p.role === 'owner' || p.own_brand_id === brand.id) 
        || brandProfiles[0] 
        || null;

      let owner = null;
      if (ownerProfile) {
        const authInfo = userEmailMap.get(ownerProfile.id);
        owner = {
          id: ownerProfile.id,
          full_name: ownerProfile.full_name || 'ไม่ระบุชื่อ',
          phone: ownerProfile.phone || brand.phone || '-',
          avatar_url: ownerProfile.avatar_url || null,
          role: ownerProfile.role || 'owner',
          email: authInfo?.email || '-',
          created_at: ownerProfile.created_at || authInfo?.created_at || brand.created_at,
          last_sign_in_at: authInfo?.last_sign_in_at || null,
        };
      }

      const members = brandProfiles.map(p => {
        const authInfo = userEmailMap.get(p.id);
        return {
          id: p.id,
          full_name: p.full_name || 'ไม่ระบุชื่อ',
          phone: p.phone || '-',
          avatar_url: p.avatar_url || null,
          role: p.role || 'staff',
          email: authInfo?.email || '-',
        };
      });

      // Use exact real-time product count from products table
      const exactProductCount = productCountMap.has(brand.id) 
        ? productCountMap.get(brand.id)! 
        : (brand.total_products || 0);

      return {
        ...brand,
        total_products: exactProductCount,
        owner,
        members_count: brandProfiles.length,
        members,
      };
    });

    const response = NextResponse.json({
      success: true,
      data: enrichedBrands,
    });

    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  } catch (error: any) {
    console.error('❌ [Admin Brands API Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
