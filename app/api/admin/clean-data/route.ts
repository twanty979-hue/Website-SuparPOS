import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET list of brands & current row counts of key tables
export async function GET() {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. ดึงรายชื่อแบรนด์ทั้งหมด
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('id, name')
      .order('name', { ascending: true });

    if (brandsError) throw brandsError;

    // 2. ดึงจำนวนแถวปัจจุบันของตารางสำคัญในฐานข้อมูล (ใช้วิธี HEAD query เพื่อให้ทำงานเร็วมาก)
    const tablesToCount = [
      { name: 'brands', label: 'แบรนด์ (ร้านค้า)' },
      { name: 'profiles', label: 'บัญชีแคชเชียร์/เจ้าของร้าน' },
      { name: 'products', label: 'เมนูสินค้า POS' },
      { name: 'product_master', label: 'สินค้าคลังคุมสต็อก' },
      { name: 'tables', label: 'โต๊ะอาหาร' },
      { name: 'orders', label: 'ออเดอร์ขาย (Orders)' },
      { name: 'order_items', label: 'รายการอาหารในบิล (Order Items)' },
      { name: 'pai_orders', label: 'ประวัติจ่ายเงิน (Payments)' },
      { name: 'stock_logs', label: 'ประวัติหักสต็อกสินค้าปลีก' },
      { name: 'ingredient_stock_movements', label: 'ประวัติหักสต็อกวัตถุดิบครัว' }
    ];

    const tableCounts = [];
    for (const t of tablesToCount) {
      const { count, error: countErr } = await supabase
        .from(t.name)
        .select('*', { count: 'exact', head: true });
        
      tableCounts.push({
        name: t.name,
        label: t.label,
        count: countErr ? 0 : (count || 0)
      });
    }

    return NextResponse.json({ success: true, brands, tableCounts });
  } catch (error: any) {
    console.error('❌ [Get Brands & Counts Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { brandId, action } = await request.json();

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    if (action === 'clear-all-transactions') {
      console.log('⚡ Starting full database transaction cleanup for all brands...');

      await supabase.from('orders').update({ payment_id: null }).gt('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('order_item_toppings').delete().gt('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('order_items').delete().gt('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('pai_orders').delete().gt('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('orders').delete().gt('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('stock_logs').delete().gt('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('ingredient_stock_movements').delete().gt('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('ingredient_stock_balances').delete().gt('ingredient_id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('cashier_shifts').delete().gt('id', '00000000-0000-0000-0000-000000000000');

      await supabase.from('dashboard_daily_sales').delete().gt('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('dashboard_hourly_sales').delete().gt('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('dashboard_product_stats').delete().gt('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('dashboard_payment_stats').delete().gt('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('dashboard_table_stats').delete().gt('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('dashboard_topping_stats').delete().gt('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('dashboard_cashier_stats').delete().gt('id', '00000000-0000-0000-0000-000000000000');

      return NextResponse.json({ success: true, message: 'ล้างข้อมูลธุรกรรมทั้งหมดทุกแบรนด์เรียบร้อยแล้ว' });
    }

    if (!brandId) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุแบรนด์' }, { status: 400 });
    }

    if (action === 'clear-transactions') {
      console.log(`⚡ Starting database transaction cleanup for brand: ${brandId}`);

      const { data: orders } = await supabase.from('orders').select('id').eq('brand_id', brandId);
      const orderIds = orders?.map(o => o.id) || [];

      await supabase.from('orders').update({ payment_id: null }).eq('brand_id', brandId);
      await supabase.from('order_item_toppings').delete().eq('brand_id', brandId);
      if (orderIds.length > 0) {
        await supabase.from('order_items').delete().in('order_id', orderIds);
        await supabase.from('stock_logs').delete().in('order_id', orderIds);
      }

      await supabase.from('pai_orders').delete().eq('brand_id', brandId);
      await supabase.from('orders').delete().eq('brand_id', brandId);
      await supabase.from('ingredient_stock_movements').delete().eq('brand_id', brandId);
      await supabase.from('ingredient_stock_balances').delete().eq('brand_id', brandId);
      await supabase.from('cashier_shifts').delete().eq('brand_id', brandId);

      await supabase.from('dashboard_daily_sales').delete().eq('brand_id', brandId);
      await supabase.from('dashboard_hourly_sales').delete().eq('brand_id', brandId);
      await supabase.from('dashboard_product_stats').delete().eq('brand_id', brandId);
      await supabase.from('dashboard_payment_stats').delete().eq('brand_id', brandId);
      await supabase.from('dashboard_table_stats').delete().eq('brand_id', brandId);
      await supabase.from('dashboard_topping_stats').delete().eq('brand_id', brandId);
      await supabase.from('dashboard_cashier_stats').delete().eq('brand_id', brandId);

      return NextResponse.json({ success: true, message: 'ล้างข้อมูลธุรกรรมของแบรนด์ที่เลือกเรียบร้อยแล้ว' });
    }

    if (action === 'delete-brand') {
      console.log(`🔥 Starting full brand deletion for brand: ${brandId}`);

      // 1. ดึง ID ของออเดอร์ทั้งหมดในแบรนด์นี้
      const { data: orders } = await supabase.from('orders').select('id').eq('brand_id', brandId);
      const orderIds = orders?.map(o => o.id) || [];

      // 2. ปลด payment_id ใน orders ชั่วคราว
      await supabase.from('orders').update({ payment_id: null }).eq('brand_id', brandId);

      // 3. ลบข้อมูลการขายและรายละเอียดบิล
      await supabase.from('order_item_toppings').delete().eq('brand_id', brandId);
      if (orderIds.length > 0) {
        await supabase.from('order_items').delete().in('order_id', orderIds);
        await supabase.from('stock_logs').delete().in('order_id', orderIds);
      }
      await supabase.from('pai_orders').delete().eq('brand_id', brandId);
      await supabase.from('orders').delete().eq('brand_id', brandId);

      // 4. ลบประวัติสต็อกวัตถุดิบและข้อมูลวัตถุดิบทั้งหมด
      await supabase.from('ingredient_stock_movements').delete().eq('brand_id', brandId);
      await supabase.from('ingredient_stock_balances').delete().eq('brand_id', brandId);

      // ดึง ID ของสูตรอาหารในแบรนด์นี้เพื่อลบ recipe items
      const { data: recipes } = await supabase.from('product_recipes').select('id').eq('brand_id', brandId);
      const recipeIds = recipes?.map(r => r.id) || [];
      if (recipeIds.length > 0) {
        await supabase.from('product_recipe_items').delete().in('recipe_id', recipeIds);
      }
      await supabase.from('product_recipes').delete().eq('brand_id', brandId);

      // ดึง ID ของวัตถุดิบในแบรนด์นี้เพื่อลบ ingredient units
      const { data: ingredients } = await supabase.from('ingredients').select('id').eq('brand_id', brandId);
      const ingredientIds = ingredients?.map(i => i.id) || [];
      if (ingredientIds.length > 0) {
        await supabase.from('ingredient_units').delete().in('ingredient_id', ingredientIds);
      }

      const { data: receipts } = await supabase.from('ingredient_receipts').select('id').eq('brand_id', brandId);
      const receiptIds = receipts?.map(r => r.id) || [];
      if (receiptIds.length > 0) {
        await supabase.from('ingredient_receipt_items').delete().in('receipt_id', receiptIds);
      }
      await supabase.from('ingredient_receipts').delete().eq('brand_id', brandId);

      await supabase.from('ingredients').delete().eq('brand_id', brandId);
      await supabase.from('ingredient_categories').delete().eq('brand_id', brandId);
      await supabase.from('measurement_units').delete().eq('brand_id', brandId);

      // 5. ลบสต็อกสินค้าขายปลีก
      const { data: productsMaster } = await supabase.from('product_master').select('id').eq('brand_id', brandId);
      const productMasterIds = productsMaster?.map(p => p.id) || [];
      if (productMasterIds.length > 0) {
        await supabase.from('stock').delete().in('product_id', productMasterIds);
      }
      await supabase.from('product_master').delete().eq('brand_id', brandId);
      await supabase.from('master_categories').delete().eq('brand_id', brandId);

      // 6. ลบข้อมูลสินค้า เมนู และท็อปปิ้ง
      const { data: discounts } = await supabase.from('discounts').select('id').eq('brand_id', brandId);
      const discountIds = discounts?.map(d => d.id) || [];
      if (discountIds.length > 0) {
        await supabase.from('discount_products').delete().in('discount_id', discountIds);
      }
      await supabase.from('discounts').delete().eq('brand_id', brandId);

      await supabase.from('product_topping_groups').delete().eq('brand_id', brandId);
      await supabase.from('topping_items').delete().eq('brand_id', brandId);
      await supabase.from('topping_groups').delete().eq('brand_id', brandId);
      await supabase.from('products').delete().eq('brand_id', brandId);
      await supabase.from('categories').delete().eq('brand_id', brandId);

      // 7. ลบโต๊ะและแบนเนอร์
      await supabase.from('tables').delete().eq('brand_id', brandId);
      await supabase.from('banners').delete().eq('brand_id', brandId);

      // 8. ลบสถิติรายงานแดชบอร์ด
      await supabase.from('dashboard_daily_sales').delete().eq('brand_id', brandId);
      await supabase.from('dashboard_hourly_sales').delete().eq('brand_id', brandId);
      await supabase.from('dashboard_product_stats').delete().eq('brand_id', brandId);
      await supabase.from('dashboard_payment_stats').delete().eq('brand_id', brandId);
      await supabase.from('dashboard_table_stats').delete().eq('brand_id', brandId);
      await supabase.from('dashboard_topping_stats').delete().eq('brand_id', brandId);
      await supabase.from('dashboard_cashier_stats').delete().eq('brand_id', brandId);
      await supabase.from('cashier_shifts').delete().eq('brand_id', brandId);

      // 9. ลบ Log และ Shift ต่างๆ
      await supabase.from('invitation_logs').delete().eq('from_brand_id', brandId);
      await supabase.from('coin_logs').delete().eq('brand_id', brandId);
      await supabase.from('payment_logs').delete().eq('brand_id', brandId);
      await supabase.from('profile_fcm_tokens').delete().eq('brand_id', brandId);

      // 10. ดึงรายชื่อบัญชี (Profiles/Users) ทั้งหมดที่ผูกกับแบรนด์นี้
      const { data: brandProfiles } = await supabase
        .from('profiles')
        .select('id')
        .or(`brand_id.eq.${brandId},own_brand_id.eq.${brandId},invited_brand_id.eq.${brandId}`);

      if (brandProfiles && brandProfiles.length > 0) {
        console.log(`👤 Found ${brandProfiles.length} profiles associated with brand. Deleting auth accounts...`);
        for (const p of brandProfiles) {
          const { error: deleteUserErr } = await supabase.auth.admin.deleteUser(p.id);
          if (deleteUserErr) {
            console.error(`⚠️ Failed to delete auth user ${p.id}:`, deleteUserErr.message);
          }
        }
      }

      // 11. ลบข้อมูลแบรนด์หลักเป็นลำดับสุดท้าย
      const { error: deleteBrandErr } = await supabase.from('brands').delete().eq('id', brandId);
      if (deleteBrandErr) throw deleteBrandErr;

      console.log(`✅ Fully deleted brand ${brandId} and all associated resources.`);
      return NextResponse.json({ success: true, message: 'ลบแบรนด์ ข้อมูลร้านค้า และบัญชีผู้ใช้ในระบบทั้งหมดเรียบร้อยแล้ว' });
    }

    return NextResponse.json({ success: false, error: 'การกระทำไม่ถูกต้อง' }, { status: 400 });
  } catch (error: any) {
    console.error('❌ [Clean/Delete Brand Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
