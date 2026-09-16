// app/actions/tableActions.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { checkOrderLimitOrThrow } from './limitGuard';
import { exceedsLimit, getBrandPlanPermissions } from '@/lib/planPermissions';

const makeTableToken = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const makeTokenBatch = (count: number) => {
    const safeCount = Math.max(1, Math.min(50, Math.floor(Number(count) || 1)));
    const tokens = new Set<string>();
    while (tokens.size < safeCount) tokens.add(makeTableToken());
    return Array.from(tokens);
};
// Helper: สร้าง Client (ใช้ Key ฝั่ง Server)
async function getSupabase() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.SUPABASE_URL!,       // ✅ เปลี่ยน
        process.env.SUPABASE_ANON_KEY!,  // ✅ เปลี่ยน
        { cookies: { get(name) { return cookieStore.get(name)?.value } } }
    );
}

// Helper: หา brand_id ของ User ปัจจุบัน (ใช้ซ้ำบ่อย แยกออกมาเลย)
async function getMyBrandId(supabase: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase.from('profiles').select('brand_id').eq('id', user.id).single();
    if (!profile?.brand_id) throw new Error("No brand assigned");
    
    return profile.brand_id;
}

// 1. ดึง Config
export async function getBrandConfigAction() {
    const supabase = await getSupabase();
    try {
        const brandId = await getMyBrandId(supabase); // ✅ ใช้ Helper

        const { data: brand } = await supabase
            .from('brands')
            .select('id, qr_image_url, slug, config, table_qr_mode')
            .eq('id', brandId)
            .single();

        let finalLogoUrl = null;
        if (brand?.qr_image_url) {
            const fullPath = `${brand.id}/${brand.qr_image_url}`;
            const { data } = supabase.storage.from('brands').getPublicUrl(fullPath);
            finalLogoUrl = data.publicUrl;
        }

        return { 
            success: true, 
            brandId: brandId, 
            qrLogoUrl: finalLogoUrl, 
            brandSlug: brand?.slug || 'shop',
            qrMode: brand?.table_qr_mode || brand?.config?.qr_mode || 'rotating'
        };
    } catch (err: any) { 
        return { success: false, error: err.message }; 
    }
}

// 2. ดึงโต๊ะ
export async function getTablesAction() {
    const supabase = await getSupabase();
    try {
        const brandId = await getMyBrandId(supabase); // ✅ ใช้ Helper

        const { data, error } = await supabase
            .from('tables')
            .select('*')
            .eq('brand_id', brandId)
            .order('label', { ascending: true });

        if (error) throw error;
        const { plan, limits } = await getBrandPlanPermissions(getAdminSupabase(), brandId);
        return {
            success: true,
            data,
            plan,
            limits: { max_tables: limits.max_tables },
            usage: data?.filter((table) => table.is_active !== false).length || 0,
        };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

// 3. เพิ่มโต๊ะ (❌ ไม่รับ brandId จาก Client แล้ว)
export async function addTableAction(label: string) {
    const supabase = await getSupabase();
    try {
        const brandId = await getMyBrandId(supabase); // ✅ หาเองจาก Session ปลอดภัยกว่า

        const admin = getAdminSupabase();
        const { plan, limits } = await getBrandPlanPermissions(admin, brandId);
        const { count, error: countError } = await admin
            .from('tables')
            .select('id', { count: 'exact', head: true })
            .eq('brand_id', brandId)
            .eq('is_active', true);
        if (countError) throw countError;

        if (exceedsLimit((count || 0) + 1, limits.max_tables)) {
            return {
                success: false,
                code: 'TABLE_LIMIT_EXCEEDED',
                error: `แพ็กเกจ ${plan.toUpperCase()} เพิ่มโต๊ะได้สูงสุด ${limits.max_tables} โต๊ะ (ขณะนี้มี ${count || 0} โต๊ะ)`,
                limit: limits.max_tables,
                usage: count || 0,
            };
        }

        const token = makeTableToken();
        const { data, error } = await supabase.from('tables').insert({
            label, 
            brand_id: brandId, 
            status: 'available',
            access_token: token,
            access_tokens: [token]
        }).select().single();

        if (error) throw error;
        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

// 4. ลบโต๊ะ (✅ เช็คความเป็นเจ้าของก่อนลบ)
export async function deleteTableAction(id: string) {
    const supabase = await getSupabase();
    try {
        const brandId = await getMyBrandId(supabase);

        const { error } = await supabase
            .from('tables')
            .delete()
            .eq('id', id)
            .eq('brand_id', brandId); // ✅ ต้องตรงกับร้านเราเท่านั้น

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

// 5. รีเซ็ต Passcode (✅ เช็คความเป็นเจ้าของ)
export async function refreshTokenAction(id: string) {
    const supabase = await getSupabase();
    try {
        const brandId = await getMyBrandId(supabase);
        const newToken = makeTableToken();

        const { error } = await supabase
            .from('tables')
            .update({ access_token: newToken, access_tokens: [newToken], status: 'available' })
            .eq('id', id)
            .eq('brand_id', brandId); // ✅ ต้องตรงกับร้านเราเท่านั้น

        if (error) throw error;
        return { success: true, newToken };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

// 6. ดึงข้อมูลโต๊ะเดียว (Public ได้ เพราะเอาไว้ให้ลูกค้าสแกน แต่ถ้าจะกันเหนียวก็กรองได้)
export async function getLatestTableDataAction(tableId: string) {
    const supabase = await getSupabase();
    // อันนี้อาจจะไม่ต้องเช็ค Auth เพราะลูกค้าเป็นคนเรียก (Scan QR)
    try {
        const { data, error } = await supabase
            .from('tables')
            .select('*')
            .eq('id', tableId)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

function getAdminSupabase() {
    return createClient(
        process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

export async function generateTableQrTokensAction(id: string, count: number) {
    const supabase = await getSupabase();
    try {
        const brandId = await getMyBrandId(supabase);
        const tokens = makeTokenBatch(count);
        const { data, error } = await supabase
            .from('tables')
            .update({
                access_token: tokens[0],
                access_tokens: tokens,
                status: 'available'
            })
            .eq('id', id)
            .eq('brand_id', brandId)
            .select('*')
            .single();

        if (error) throw error;
        return { success: true, tokens, data };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
