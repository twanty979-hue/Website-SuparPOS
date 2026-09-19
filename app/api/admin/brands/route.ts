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

    // 3. Fetch pai_orders for sales revenue analysis
    const { data: paiOrders, error: paiError } = await supabase
      .from('pai_orders')
      .select('id, brand_id, total_amount, created_at, payment_method');

    if (paiError) {
      console.warn('⚠️ Could not fetch pai_orders:', paiError.message);
    }

    // 4. Fetch tables with access tokens for customer ordering links
    const { data: tablesData, error: tablesError } = await supabase
      .from('tables')
      .select('id, brand_id, label, access_token, access_tokens, status, is_active')
      .order('label', { ascending: true });

    if (tablesError) {
      console.warn('⚠️ Could not fetch tables:', tablesError.message);
    }

    // 5. Fetch brand configuration (table_qr_mode, slug) from brands table
    const { data: brandsExtra } = await supabase
      .from('brands')
      .select('id, table_qr_mode, slug');

    const brandConfigMap = new Map<string, { table_qr_mode?: string; slug?: string }>();
    (brandsExtra || []).forEach(b => {
      brandConfigMap.set(b.id, { table_qr_mode: b.table_qr_mode, slug: b.slug });
    });

    // Compute sales statistics (per brand and overall)
    const now = new Date();
    const thTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const todayStr = thTime.toISOString().split('T')[0];

    type BrandSalesStat = {
      total_sales: number;
      today_sales: number;
      paid_orders_count: number;
      last_paid_at: string | null;
    };
    const salesMap = new Map<string, BrandSalesStat>();
    let grandTotalSales = 0;
    let grandTodaySales = 0;
    let grandPaidOrdersCount = 0;

    (paiOrders || []).forEach(order => {
      const brandId = order.brand_id;
      if (!brandId) return;

      const amount = Number(order.total_amount) || 0;
      const orderThDate = new Date(new Date(order.created_at).getTime() + 7 * 60 * 60 * 1000).toISOString().split('T')[0];
      const isToday = orderThDate === todayStr;

      grandTotalSales += amount;
      grandPaidOrdersCount += 1;
      if (isToday) {
        grandTodaySales += amount;
      }

      const current = salesMap.get(brandId) || {
        total_sales: 0,
        today_sales: 0,
        paid_orders_count: 0,
        last_paid_at: null,
      };

      current.total_sales += amount;
      current.paid_orders_count += 1;
      if (isToday) {
        current.today_sales += amount;
      }
      if (!current.last_paid_at || new Date(order.created_at) > new Date(current.last_paid_at)) {
        current.last_paid_at = order.created_at;
      }

      salesMap.set(brandId, current);
    });

    // Map tables by brand and construct customer ordering URL path
    type TableInfo = {
      id: string;
      brand_id: string;
      label: string;
      access_token?: string | null;
      access_tokens?: any;
      status?: string;
      is_active?: boolean;
      order_url_path: string;
    };
    const tablesMap = new Map<string, TableInfo[]>();

    (tablesData || []).forEach(t => {
      if (!t.brand_id) return;
      const brandConfig = brandConfigMap.get(t.brand_id);
      const slug = brandConfig?.slug || 'shop';
      const isStatic = brandConfig?.table_qr_mode === 'static';

      let token = '';
      if (!isStatic) {
        if (Array.isArray(t.access_tokens) && t.access_tokens.length > 0) {
          token = String(t.access_tokens[0]);
        } else if (t.access_token) {
          token = String(t.access_token);
        }
      }

      const order_url_path = `/${slug}/${t.brand_id}/table/${isStatic ? t.id : `${t.id}${token}`}`;

      const item: TableInfo = {
        id: t.id,
        brand_id: t.brand_id,
        label: t.label || `โต๊ะ ${t.id.slice(0, 4)}`,
        access_token: t.access_token,
        access_tokens: t.access_tokens,
        status: t.status,
        is_active: t.is_active,
        order_url_path,
      };

      const list = tablesMap.get(t.brand_id) || [];
      list.push(item);
      tablesMap.set(t.brand_id, list);
    });

    // 6. Fetch profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, phone, avatar_url, role, brand_id, own_brand_id, created_at, updated_at');
    
    if (profileError) {
      console.warn('⚠️ Could not fetch profiles:', profileError.message);
    }

    // 7. Fetch Auth Users for emails & auth metadata
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

    // 8. Map profiles and attach owner info + accurate real-time product count + sales + tables
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

      const sales = salesMap.get(brand.id) || {
        total_sales: 0,
        today_sales: 0,
        paid_orders_count: 0,
        last_paid_at: null,
      };

      const brandTables = tablesMap.get(brand.id) || [];
      const brandConfig = brandConfigMap.get(brand.id);
      const slug = brandConfig?.slug || brand.slug || 'shop';
      const table_qr_mode = brandConfig?.table_qr_mode || 'rotating';
      const default_table_url = brandTables.length > 0 ? brandTables[0].order_url_path : null;

      return {
        ...brand,
        slug,
        table_qr_mode,
        total_products: exactProductCount,
        owner,
        members_count: brandProfiles.length,
        members,
        total_sales: sales.total_sales,
        today_sales: sales.today_sales,
        paid_orders_count: sales.paid_orders_count,
        last_paid_at: sales.last_paid_at,
        tables: brandTables,
        default_table_url,
      };
    });

    const response = NextResponse.json({
      success: true,
      data: enrichedBrands,
      summary: {
        grand_total_sales: grandTotalSales,
        grand_today_sales: grandTodaySales,
        grand_paid_orders_count: grandPaidOrdersCount,
      },
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
