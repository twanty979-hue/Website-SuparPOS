// app/actions/limitGuard.ts
'use server'

import 'server-only';
import { createClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import { getBrandPlanPermissions } from '@/lib/planPermissions';

// Helper สร้าง Supabase
async function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ----------------------------------------------------------------------------
// 🛡️ ฟังก์ชัน 1: เช็คและบล็อก (ใช้ตอนกดจ่ายเงิน ใน PaymentActions)
// ----------------------------------------------------------------------------
export async function checkOrderLimitOrThrow(brandId: string) {
    const supabase = await getSupabase();
    const now = dayjs();

    const { plan, limits } = await getBrandPlanPermissions(supabase, brandId);

    // ✅ ถ้า max_orders เป็น 0 (Unlimited) -> ผ่านตลอด ไม่จำกัด
    if (limits.max_orders === 0) return true; 

    // 3. เริ่มนับยอดขาย 30 วันย้อนหลัง
    const startOfPeriod = now.subtract(30, 'day').startOf('day').toISOString();
    const endOfPeriod = now.endOf('day').toISOString();

    // ดึงออเดอร์ที่เป็นโต๊ะมาก่อน
    const { data: tableOrders, error: orderErr } = await supabase
        .from('orders')
        .select('id')
        .eq('brand_id', brandId)
        .eq('type', 'table')
        .not('table_id', 'is', null)
        .gte('created_at', startOfPeriod);
        
    if (orderErr) throw new Error("ระบบตรวจสอบโควต้าขัดข้อง");
    
    const orderIds = tableOrders?.map(o => o.id) || [];
    
    let usage = 0;
    if (orderIds.length > 0) {
        const { count, error } = await supabase
            .from('pai_orders')
            .select('id', { count: 'exact', head: true })
            .in('order_id', orderIds)
            .gte('created_at', startOfPeriod)
            .lte('created_at', endOfPeriod);
            
        if (error) throw new Error("ระบบตรวจสอบโควต้าขัดข้อง");
        usage = count || 0;
    }

    // 4. ตัดสิน: ถ้าเกิน Limit -> ระเบิด Error
    if (usage >= limits.max_orders) {
        throw new Error(`🚫 แพ็กเกจ ${plan.toUpperCase()} จำกัดสแกนสั่งอาหาร ${limits.max_orders} บิล/เดือน (ใช้ไปแล้ว ${usage}) กรุณาอัปเกรด!`);
    }

    return true; 
}

// ----------------------------------------------------------------------------
// 📊 ฟังก์ชัน 2: ดึงข้อมูลสถานะไปโชว์ (ใช้แสดงผลที่ปุ่ม QR Code และหน้าตั้งค่าร้านค้า)
// ----------------------------------------------------------------------------
export async function getOrderUsage(brandId: string, customSupabase?: any) {
    const supabase = customSupabase || await getSupabase();
    const now = dayjs();

    const { plan, limits } = await getBrandPlanPermissions(supabase, brandId);

    // ดึงจำนวนโต๊ะ สินค้า/อาหาร และพนักงาน แบบขนาน (Direct Count)
    const [
      { count: tableCount },
      { count: productCount },
      { count: staffCount }
    ] = await Promise.all([
      supabase
        .from('tables')
        .select('id', { count: 'exact', head: true })
        .eq('brand_id', brandId)
        .eq('is_active', true),
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('brand_id', brandId)
        .is('deleted_at', null),
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('brand_id', brandId),
    ]);

    const staffLimit = plan === 'pro' ? 3 : (plan === 'ultimate' ? 0 : 1);

    // กรณีแพ็กเกจที่ไม่จำกัดออเดอร์ (Infinity)
    if (limits.max_orders === 0) {
        return { 
            usage: 0, 
            limit: Infinity, 
            isLocked: false, 
            plan, 
            history: [],
            tablesCount: tableCount || 0,
            tablesLimit: limits.max_tables,
            foodsCount: productCount || 0,
            foodsLimit: limits.max_food_items,
            staffCount: staffCount || 1,
            staffLimit: staffLimit,
            permissions: limits,
        };
    }

    // กรณีกำหนดขีดจำกัดออเดอร์ (Free 300, Go 1,000) -> นับยอด 30 วันย้อนหลัง
    const startOfPeriod = now.subtract(30, 'day').startOf('day').toISOString();
    const endOfPeriod = now.endOf('day').toISOString();
    
    // ดึงเฉพาะ order_id ของโต๊ะ
    const { data: tableOrders } = await supabase
        .from('orders')
        .select('id')
        .eq('brand_id', brandId)
        .eq('type', 'table')
        .not('table_id', 'is', null)
        .gte('created_at', startOfPeriod);
        
    const orderIds = tableOrders?.map((o: any) => o.id) || [];
    
    let ordersData: any[] = [];
    if (orderIds.length > 0) {
        const { data } = await supabase
            .from('pai_orders')
            .select('created_at')
            .in('order_id', orderIds)
            .gte('created_at', startOfPeriod)
            .lte('created_at', endOfPeriod);
        ordersData = data || [];
    }

    const usage = ordersData.length;

    const historyMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
        historyMap[now.subtract(i, 'day').format('YYYY-MM-DD')] = 0;
    }
    
    if (ordersData) {
        for (const order of ordersData) {
            if (order.created_at) {
                const dateStr = dayjs(order.created_at).format('YYYY-MM-DD');
                if (historyMap[dateStr] !== undefined) {
                    historyMap[dateStr]++;
                }
            }
        }
    }

    const history = Object.entries(historyMap).map(([date, count]) => ({ date, count }));

    return { 
        usage, 
        limit: limits.max_orders, 
        isLocked: limits.max_orders > 0 && usage >= limits.max_orders, 
        plan,
        history,
        tablesCount: tableCount || 0,
        tablesLimit: limits.max_tables,
        foodsCount: productCount || 0,
        foodsLimit: limits.max_food_items,
        staffCount: staffCount || 1,
        staffLimit: staffLimit,
        permissions: limits,
    };
}
