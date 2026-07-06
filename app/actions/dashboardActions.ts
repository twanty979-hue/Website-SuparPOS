// app/actions/dashboardActions.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import dayjs from 'dayjs';
import 'dayjs/locale/th'; 
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Holidays from 'date-holidays';

dayjs.extend(utc);
dayjs.extend(timezone);

function getCountryFromTimezone(tz: string): string {
    if (!tz) return 'TH';
    const parts = tz.split('/');
    const city = parts[parts.length - 1]; // เอาตัวท้ายสุดชัวร์กว่า
    
    const tzMap: Record<string, string> = {
        'Bangkok': 'TH', 'Tokyo': 'JP', 'Seoul': 'KR', 'Shanghai': 'CN', 
        'Hong_Kong': 'HK', 'Singapore': 'SG', 'London': 'GB', 'Paris': 'FR', 
        'Berlin': 'DE', 'Dubai': 'AE', 'New_York': 'US', 'Los_Angeles': 'US', 
        'Chicago': 'US', 'Sydney': 'AU', 'Melbourne': 'AU', 'Manila': 'PH', 
        'Jakarta': 'ID', 'Ho_Chi_Minh': 'VN', 'Phnom_Penh': 'KH', 'Vientiane': 'LA',
        'Taipei': 'TW', 'Amsterdam': 'NL', 'Zurich': 'CH' // เพิ่มเมืองฝั่งยุโรป
    };
    return tzMap[city] || 'TH';
}

function calculateEffectivePlan(brand: any) {
    const now = dayjs();
    const parseExpiry = (dateString: string | null) => {
        if (!dateString) return null;
        const safeDateStr = dateString.replace(' ', 'T'); 
        return dayjs(safeDateStr);
    };
    
    const expUltimate = parseExpiry(brand.expiry_ultimate);
    if (expUltimate && expUltimate.isValid() && expUltimate.isAfter(now)) {
        return 'ultimate';
    }
    const expPro = parseExpiry(brand.expiry_pro);
    if (expPro && expPro.isValid() && expPro.isAfter(now)) {
        return 'pro';
    }
    const expBasic = parseExpiry(brand.expiry_basic);
    if (expBasic && expBasic.isValid() && expBasic.isAfter(now)) {
        return 'basic';
    }
    return 'free'; 
}

export async function getDashboardDataAction(
    range: string = 'month',
    customFrom?: string, 
    customTo?: string
) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        { cookies: { get(name) { return cookieStore.get(name)?.value } } }
    );

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { data: profile } = await supabase
            .from('profiles')
            .select('brand_id, brands(timezone, plan, expiry_basic, expiry_pro, expiry_ultimate)') 
            .eq('id', user.id)
            .single();
        
        if (!profile?.brand_id) throw new Error("No brand assigned");
        const brandId = profile.brand_id;
        
        const brand = Array.isArray(profile.brands) ? profile.brands[0] : profile.brands;
        const brandTimezone = brand?.timezone || 'Asia/Bangkok';
        
        const effectivePlan = calculateEffectivePlan(brand);

        const localCountryCode = getCountryFromTimezone(brandTimezone);
        const hdLocal = new Holidays(localCountryCode, 'en');
        const hdCN = new Holidays('CN', 'en'); 
        const hdUS = new Holidays('US', 'en');

        let now = dayjs().tz(brandTimezone);
        let startDate: any = now;
        let endDate: any = now;
        let isAllTime = false;

        const anchorDate = customFrom ? dayjs.tz(customFrom, brandTimezone) : now;

        if (range === 'today') {
            startDate = anchorDate.startOf('day');
            endDate = anchorDate.endOf('day');
        } else if (range === 'yesterday') {
            startDate = anchorDate.subtract(1, 'day').startOf('day');
            endDate = anchorDate.subtract(1, 'day').endOf('day');
        } else if (range === 'last7days') {
            startDate = anchorDate.subtract(6, 'day').startOf('day');
            endDate = anchorDate.endOf('day');
        } else if (range === 'last30days') {
            startDate = anchorDate.subtract(29, 'day').startOf('day');
            endDate = anchorDate.endOf('day');
        } else if (range === 'thisMonth' || range === 'month') {
            startDate = anchorDate.startOf('month');
            endDate = anchorDate.endOf('month');
        } else if (range === 'lastMonth') {
            startDate = anchorDate.subtract(1, 'month').startOf('month');
            endDate = anchorDate.subtract(1, 'month').endOf('month');
        } else if (range === 'custom') {
            if (customFrom) startDate = dayjs.tz(customFrom, brandTimezone).startOf('day');
            if (customTo) endDate = dayjs.tz(customTo, brandTimezone).endOf('day');
        } else if (range === 'all') {
            isAllTime = true;
        }

        // =========================================================
        // 🛡️ Limit Guard: 30 วันสำหรับ Free Plan
        // =========================================================
        let limitWarning = false;
        
        if (effectivePlan === 'free') {
            const limitDate = now.subtract(30, 'day').startOf('day'); 
            
            if (isAllTime) {
                isAllTime = false;
                startDate = limitDate;
                limitWarning = true;
            } else if (startDate.isBefore(limitDate)) {
                startDate = limitDate;
                if (endDate.isBefore(limitDate)) {
                    endDate = limitDate;
                }
                limitWarning = true;
            }
        }
        // =========================================================

        let salesQuery = supabase.from('dashboard_daily_sales').select('*').eq('brand_id', brandId).order('report_date', { ascending: true });
        if (!isAllTime) salesQuery = salesQuery.gte('report_date', startDate.format('YYYY-MM-DD')).lte('report_date', endDate.format('YYYY-MM-DD'));
        const { data: salesData, error: salesError } = await salesQuery;
        if (salesError) throw salesError;

        let prodQuery = supabase.from('dashboard_product_stats').select('product_name, total_quantity, total_revenue').eq('brand_id', brandId);
        if (!isAllTime) prodQuery = prodQuery.gte('report_date', startDate.format('YYYY-MM-DD')).lte('report_date', endDate.format('YYYY-MM-DD'));
        const { data: productStats, error: prodError } = await prodQuery;
        if (prodError) throw prodError;

        let processedTrend: { date: string; value: number; holiday?: string; report_date?: string }[] = [];
        const parseDate = (dateStr: string) => dayjs.tz(dateStr, brandTimezone);

        const getHolidayName = (dateInput: string | Date) => { 
            const holidays: string[] = [];
            const d = dayjs.tz(dateInput, brandTimezone).toDate();
            const addHoliday = (type: string, name: string) => { if (!holidays.some(h => h.includes(name))) holidays.push(`${type}|${name}`); };

            const hLocal = hdLocal.isHoliday(d);
            if (hLocal) { const list = Array.isArray(hLocal) ? hLocal : [hLocal]; list.forEach((h: any) => addHoliday('local', h.name)); }

            const hCN = hdCN.isHoliday(d);
            if (hCN) { const list = Array.isArray(hCN) ? hCN : [hCN]; list.forEach((h: any) => { if (h.name.includes('Chinese New Year')) addHoliday('china', "Chinese New Year"); }); }

            const hUS = hdUS.isHoliday(d);
            if (hUS) { const list = Array.isArray(hUS) ? hUS : [hUS]; list.forEach((h: any) => { if (h.name.includes('Christmas') || h.name.includes('New Year') || h.name.includes('Thanksgiving')) addHoliday('global', h.name); }); }

            const month = d.getMonth() + 1; const day = d.getDate();
            if (month === 2 && day === 14) addHoliday('love', "Valentine's Day");
            if (month === 10 && day === 31) addHoliday('halloween', "Halloween");

            if (holidays.length > 0) return holidays[0]; 
            return null;
        };

        if (range === 'year') {
            const requestedYearStart = anchorDate.startOf('year');
            processedTrend = Array.from({ length: 12 }, (_, i) => {
                const d = requestedYearStart.add(i, 'month');
                return { date: d.locale('th').format('MMM'), value: 0, holiday: undefined };
            });
            salesData?.forEach((item) => {
                const itemDate = parseDate(item.report_date);
                if (itemDate.year() === requestedYearStart.year()) {
                    const idx = itemDate.month();
                    if (processedTrend[idx]) processedTrend[idx].value += Number(item.total_revenue);
                }
            });
        } else if (range === 'all') {
            processedTrend = salesData?.map(d => {
                return {
                    date: parseDate(d.report_date).locale('th').format('D MMM'), 
                    value: Number(d.total_revenue),
                    holiday: getHolidayName(d.report_date) || undefined,
                    report_date: d.report_date
                };
            }) || [];
        } else {
            const filledMap = new Map<string, { date: string; value: number; holiday?: string; report_date: string }>();
            let cur = startDate.clone();
            while (cur.isBefore(endDate) || cur.isSame(endDate, 'day')) {
                const dateStr = cur.format('YYYY-MM-DD');
                filledMap.set(dateStr, {
                    date: range === 'today' || (startDate.isSame(endDate, 'day') && range !== 'custom')
                        ? 'วันนี้' 
                        : cur.locale('th').format('D MMM'),
                    value: 0,
                    holiday: getHolidayName(dateStr) || undefined,
                    report_date: dateStr
                });
                cur = cur.add(1, 'day');
            }

            salesData?.forEach((item) => {
                const itemDateStr = parseDate(item.report_date).format('YYYY-MM-DD');
                const existing = filledMap.get(itemDateStr);
                if (existing) {
                    existing.value += Number(item.total_revenue);
                }
            });

            processedTrend = Array.from(filledMap.values());
        }

        const summary = {
            totalRevenue: salesData?.reduce((sum, item) => sum + Number(item.total_revenue), 0) || 0,
            totalOrders: salesData?.reduce((sum, item) => sum + Number(item.total_orders), 0) || 0,
        };

        const productMap = new Map();
        productStats?.forEach((p) => {
            const current = productMap.get(p.product_name) || { qty: 0, revenue: 0 };
            productMap.set(p.product_name, {
                qty: current.qty + p.total_quantity,
                revenue: current.revenue + p.total_revenue
            });
        });

        const topProducts = Array.from(productMap.entries())
            .map(([name, val]) => ({ name, qty: (val as any).qty, revenue: (val as any).revenue }))
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5);

        // Fetch advanced stats if Pro/Ultimate
        let hourlySales: any[] = [];
        let paymentStats: any[] = [];
        let tableStats: any[] = [];
        let cashierStats: any[] = [];

        if (effectivePlan === 'pro' || effectivePlan === 'ultimate') {
            try {
                let hourlyQuery = supabase.from('dashboard_hourly_sales').select('*').eq('brand_id', brandId);
                let paymentQuery = supabase.from('dashboard_payment_stats').select('*').eq('brand_id', brandId);
                let tableQuery = supabase.from('dashboard_table_stats').select('*').eq('brand_id', brandId);
                let cashierQuery = supabase.from('dashboard_cashier_stats').select(`
                    total_revenue,
                    total_payments,
                    cashier_id,
                    profiles (
                        full_name,
                        avatar_url
                    )
                `).eq('brand_id', brandId);

                if (!isAllTime) {
                    const startStr = startDate.format('YYYY-MM-DD');
                    const endStr = endDate.format('YYYY-MM-DD');
                    hourlyQuery = hourlyQuery.gte('report_date', startStr).lte('report_date', endStr);
                    paymentQuery = paymentQuery.gte('report_date', startStr).lte('report_date', endStr);
                    tableQuery = tableQuery.gte('report_date', startStr).lte('report_date', endStr);
                    cashierQuery = cashierQuery.gte('report_date', startStr).lte('report_date', endStr);
                }

                const [hourlyRes, paymentRes, tableRes, cashierRes] = await Promise.all([
                    hourlyQuery,
                    paymentQuery,
                    tableQuery,
                    cashierQuery
                ]);

                if (hourlyRes.error || paymentRes.error || tableRes.error || cashierRes.error) {
                    throw new Error("Query failed, falling back to base tables");
                }

                const hourlyRaw = hourlyRes.data || [];
                const paymentRaw = paymentRes.data || [];
                const tableRaw = tableRes.data || [];
                const cashierRaw = cashierRes.data || [];

                // A. Hourly aggregation (0 - 23)
                const hourlyMap: Record<number, { hour: number, revenue: number, orders: number }> = {};
                for (let h = 0; h < 24; h++) {
                    hourlyMap[h] = { hour: h, revenue: 0, orders: 0 };
                }
                hourlyRaw.forEach(row => {
                    const h = Number(row.report_hour);
                    if (hourlyMap[h] !== undefined) {
                        hourlyMap[h].revenue += Number(row.total_revenue || 0);
                        hourlyMap[h].orders += Number(row.total_payments || 0);
                    }
                });
                hourlySales = Object.values(hourlyMap);

                // B. Payment aggregation
                const paymentMap: Record<string, { method: string, revenue: number, orders: number }> = {};
                paymentRaw.forEach(row => {
                    const m = (row.payment_method || 'unknown').toLowerCase();
                    if (!paymentMap[m]) {
                        paymentMap[m] = { method: m, revenue: 0, orders: 0 };
                    }
                    paymentMap[m].revenue += Number(row.total_revenue || 0);
                    paymentMap[m].orders += Number(row.total_payments || 0);
                });
                paymentStats = Object.values(paymentMap);

                // C. Table aggregation
                const tableMap: Record<string, { table: string, type: string, revenue: number, orders: number }> = {};
                tableRaw.forEach(row => {
                    const key = `${row.order_type || ''}_${row.table_label || ''}`;
                    if (!tableMap[key]) {
                        tableMap[key] = {
                            table: row.table_label || '',
                            type: row.order_type || '',
                            revenue: 0,
                            orders: 0
                        };
                    }
                    tableMap[key].revenue += Number(row.total_revenue || 0);
                    tableMap[key].orders += Number(row.total_payments || 0);
                });
                tableStats = Object.values(tableMap);

                // D. Cashier aggregation
                const cashierMap: Record<string, { cashierId: string, name: string, avatarUrl: string, revenue: number, orders: number }> = {};
                cashierRaw.forEach(row => {
                    const cid = row.cashier_id || 'unknown';
                    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
                    const name = profile?.full_name || 'พนักงาน';
                    const avatarUrl = profile?.avatar_url || '';

                    if (!cashierMap[cid]) {
                        cashierMap[cid] = {
                            cashierId: cid,
                            name,
                            avatarUrl,
                            revenue: 0,
                            orders: 0
                        };
                    }
                    cashierMap[cid].revenue += Number(row.total_revenue || 0);
                    cashierMap[cid].orders += Number(row.total_payments || 0);
                });
                cashierStats = Object.values(cashierMap);

            } catch (err) {
                console.warn("⚠️ Advanced pre-aggregated tables error, aggregating from base tables...", err);
                
                // Fallback: Query from base tables (pai_orders & orders), filtering out cancelled records
                let paymentsQuery = supabase.from('pai_orders').select(`
                    id,
                    total_amount,
                    payment_method,
                    cashier_id,
                    created_at,
                    orders!inner (
                        status,
                        type,
                        table_label
                    ),
                    profiles (
                        full_name,
                        avatar_url
                    )
                `).eq('brand_id', brandId).neq('orders.status', 'cancelled');

                if (!isAllTime) {
                    const startUtc = startDate.utc().toISOString();
                    const endUtc = endDate.utc().toISOString();
                    paymentsQuery = paymentsQuery.gte('created_at', startUtc).lte('created_at', endUtc);
                }

                const { data: paymentsData, error: paymentsError } = await paymentsQuery;
                if (!paymentsError && paymentsData) {
                    // Aggregate hourly
                    const hourlyMap: Record<number, { hour: number, revenue: number, orders: number }> = {};
                    for (let h = 0; h < 24; h++) {
                        hourlyMap[h] = { hour: h, revenue: 0, orders: 0 };
                    }
                    paymentsData.forEach(p => {
                        const h = dayjs(p.created_at).tz(brandTimezone).hour();
                        hourlyMap[h].revenue += Number(p.total_amount || 0);
                        hourlyMap[h].orders += 1;
                    });
                    hourlySales = Object.values(hourlyMap);

                    // Aggregate payment
                    const paymentMap: Record<string, { method: string, revenue: number, orders: number }> = {};
                    paymentsData.forEach(p => {
                        const m = (p.payment_method || 'unknown').toLowerCase();
                        if (!paymentMap[m]) {
                            paymentMap[m] = { method: m, revenue: 0, orders: 0 };
                        }
                        paymentMap[m].revenue += Number(p.total_amount || 0);
                        paymentMap[m].orders += 1;
                    });
                    paymentStats = Object.values(paymentMap);

                    // Aggregate table
                    const tableMap: Record<string, { table: string, type: string, revenue: number, orders: number }> = {};
                    paymentsData.forEach(p => {
                        const order = Array.isArray(p.orders) ? p.orders[0] : p.orders;
                        const type = order?.type || 'pos';
                        const table = order?.table_label || '';
                        const key = `${type}_${table}`;
                        if (!tableMap[key]) {
                            tableMap[key] = {
                                table,
                                type,
                                revenue: 0,
                                orders: 0
                            };
                        }
                        tableMap[key].revenue += Number(p.total_amount || 0);
                        tableMap[key].orders += 1;
                    });
                    tableStats = Object.values(tableMap);

                    // Aggregate cashier
                    const cashierMap: Record<string, { cashierId: string, name: string, avatarUrl: string, revenue: number, orders: number }> = {};
                    paymentsData.forEach(p => {
                        const cid = p.cashier_id || 'unknown';
                        const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
                        const name = profile?.full_name || 'พนักงาน';
                        const avatarUrl = profile?.avatar_url || '';
                        if (!cashierMap[cid]) {
                            cashierMap[cid] = {
                                cashierId: cid,
                                name,
                                avatarUrl,
                                revenue: 0,
                                orders: 0
                            };
                        }
                        cashierMap[cid].revenue += Number(p.total_amount || 0);
                        cashierMap[cid].orders += 1;
                    });
                    cashierStats = Object.values(cashierMap);
                }
            }
        }

        return { 
            success: true, 
            range, 
            summary, 
            salesTrend: processedTrend, 
            chartData: processedTrend,
            topProducts, 
            limitWarning,
            effectivePlan,
            plan: effectivePlan,
            hourlySales,
            paymentStats,
            tableStats,
            cashierStats
        };

    } catch (error: any) {
        console.error("Dashboard Error:", error);
        return { success: false, error: error.message };
    }
}