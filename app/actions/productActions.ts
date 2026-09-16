// app/actions/productActions.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { exceedsLimit, getBrandPlanPermissions } from '@/lib/planPermissions';

// Helper: สร้าง Client
async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  );
}

// Helper: หา Brand ID (Security Check)
async function getMyBrandId(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase.from('profiles').select('brand_id').eq('id', user.id).single();
  if (!profile?.brand_id) throw new Error("No brand assigned");
  return profile.brand_id;
}

// --- Actions ---

export async function getProductsInitialDataAction() {
  const supabase = await getSupabase();
  try {
    const brandId = await getMyBrandId(supabase);

    const [categoriesRes, productsRes] = await Promise.all([
      supabase.from('categories').select('id, name').eq('brand_id', brandId).order('sort_order'),
      supabase.from('products').select('*').eq('brand_id', brandId).is('deleted_at', null).order('created_at', { ascending: false })
    ]);

    if (categoriesRes.error) throw categoriesRes.error;
    if (productsRes.error) throw productsRes.error;

    const { plan, limits } = await getBrandPlanPermissions(getAdminSupabase(), brandId);

    return { 
        success: true, 
        brandId,
        categories: categoriesRes.data || [],
        products: productsRes.data || [],
        plan,
        limits: { max_food_items: limits.max_food_items },
        usage: productsRes.data?.length || 0,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function upsertProductAction(payload: any) {
  const supabase = await getSupabase();
  try {
    const brandId = await getMyBrandId(supabase);

    if (!payload.id) {
      const admin = getAdminSupabase();
      const { plan, limits } = await getBrandPlanPermissions(admin, brandId);
      const { count, error: countError } = await admin
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('brand_id', brandId)
        .is('deleted_at', null);
      if (countError) throw countError;

      if (exceedsLimit((count || 0) + 1, limits.max_food_items)) {
        return {
          success: false,
          code: 'FOOD_LIMIT_EXCEEDED',
          error: `แพ็กเกจ ${plan.toUpperCase()} เพิ่มอาหารได้สูงสุด ${limits.max_food_items} รายการ (ขณะนี้มี ${count || 0} รายการ)`,
          limit: limits.max_food_items,
          usage: count || 0,
        };
      }
    }
    
   // หาช่วงโค้ดนี้ใน upsertProductAction แล้วเพิ่มบรรทัด options เข้าไปครับ
    const productData = {
        name: payload.name,
        description: payload.description,
        price: payload.price,
        price_special: payload.price_special,
        price_jumbo: payload.price_jumbo,
        category_id: payload.category_id,
        image_name: payload.image_name,
        is_recommended: payload.is_recommended,
        brand_id: brandId,
        options: payload.options || [], // 👈 เพิ่มบรรทัดนี้บรรทัดเดียวครับ
        ...(payload.id ? {} : { is_available: true }) 
    };

    if (payload.id) {
        // Update
        const { data, error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', payload.id)
            .eq('brand_id', brandId) // Security check
            .select().single();
            
        if (error) throw error;
        return { success: true, data };
    } else {
        // Insert
        const { data, error } = await supabase
            .from('products')
            .insert([productData])
            .select().single();

        if (error) throw error;
        return { success: true, data };
    }

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProductAction(id: string) {
  const supabase = await getSupabase();
  try {
    const brandId = await getMyBrandId(supabase);
    const { error } = await supabase.from('products').delete().eq('id', id).eq('brand_id', brandId);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleProductStatusAction(id: string, isAvailable: boolean) {
    const supabase = await getSupabase();
    try {
      const brandId = await getMyBrandId(supabase);
      const { error } = await supabase
        .from('products')
        .update({ is_available: isAvailable })
        .eq('id', id)
        .eq('brand_id', brandId);
      
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
}

function getAdminSupabase() {
  return createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
