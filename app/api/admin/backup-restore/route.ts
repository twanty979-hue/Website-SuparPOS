import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Helper to safely parse json fields
const safeParse = (val: any) => {
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return val; }
  }
  return val;
};

// GET: List all backup files stored on the server
export async function GET() {
  try {
    const backupsDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupsDir)) {
      return NextResponse.json({ success: true, backups: [] });
    }

    const files = fs.readdirSync(backupsDir);
    const backups = files
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const filePath = path.join(backupsDir, f);
        const stat = fs.statSync(filePath);
        const parts = f.split('_');
        const timestamp = Number(parts[0]);
        const customName = parts.slice(1).join('_').replace('.json', '');
        return {
          filename: f,
          timestamp,
          customName,
          size: stat.size,
          createdAt: new Date(timestamp).toLocaleString('th-TH')
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({ success: true, backups });
  } catch (error: any) {
    console.error('❌ [List Backups Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

const TABLES_IN_ORDER = [
  'brands',
  'profiles',
  'categories',
  'master_categories',
  'topping_groups',
  'measurement_units',
  'ingredient_categories',
  'products',
  'product_master',
  'topping_items',
  'ingredients',
  'product_topping_groups',
  'ingredient_units',
  'product_recipes',
  'ingredient_receipts',
  'product_recipe_items',
  'ingredient_receipt_items',
  'discounts',
  'discount_products',
  'stock',
  'ingredient_stock_balances',
  'tables',
  'banners',
  'orders',
  'pai_orders',
  'order_items',
  'order_item_toppings',
  'stock_logs',
  'ingredient_stock_movements',
  'cashier_shifts',
  'coin_logs',
  'payment_logs',
  'profile_fcm_tokens',
  'invitation_logs',
  'dashboard_daily_sales',
  'dashboard_hourly_sales',
  'dashboard_product_stats',
  'dashboard_payment_stats',
  'dashboard_table_stats',
  'dashboard_topping_stats',
  'dashboard_cashier_stats'
];

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { action, name, filename } = payload;

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const backupsDir = path.join(process.cwd(), 'backups');

    // --- Action: GET BACKUP INFO (Get table row counts in a backup) ---
    if (action === 'get-backup-info') {
      if (!filename) {
        return NextResponse.json({ success: false, error: 'กรุณาระบุชื่อไฟล์' }, { status: 400 });
      }

      const filePath = path.join(backupsDir, filename);
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ success: false, error: 'ไม่พบไฟล์สำรอง' }, { status: 404 });
      }

      const fileData = fs.readFileSync(filePath, 'utf-8');
      const backupData = JSON.parse(fileData);
      
      const counts: Record<string, number> = {};
      if (backupData.tables) {
        for (const tableName of Object.keys(backupData.tables)) {
          counts[tableName] = Array.isArray(backupData.tables[tableName]) 
            ? backupData.tables[tableName].length 
            : 0;
        }
      }

      return NextResponse.json({ success: true, counts });
    }

    // --- Action: BACKUP (Snapshot all tables & users) ---
    if (action === 'backup') {
      const backupName = (name || 'backup').trim();
      console.log(`📥 Starting server-side full system backup: "${backupName}"`);

      // 1. Fetch all Auth Users
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
        perPage: 1000,
      });
      if (authError) throw authError;

      const authUsers = authData?.users?.map(u => ({
        id: u.id,
        email: u.email,
        user_metadata: u.user_metadata,
      })) || [];

      // 2. Fetch all tables
      const tablesData: Record<string, any[]> = {};
      for (const table of TABLES_IN_ORDER) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
          console.error(`Error backing up table ${table}:`, error);
          throw error;
        }
        tablesData[table] = data || [];
      }

      const backupObj = {
        backupVersion: 1,
        name: backupName,
        timestamp: Date.now(),
        authUsers,
        tables: tablesData
      };

      // 3. Save file to server disk
      if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
      }

      const safeName = backupName.replace(/[^a-zA-Z0-9_\u0e00-\u0e7f]/g, '_');
      const backupFilename = `${Date.now()}_${safeName}.json`;
      const filePath = path.join(backupsDir, backupFilename);

      fs.writeFileSync(filePath, JSON.stringify(backupObj, null, 2));
      console.log(`✅ Backup successfully saved to ${filePath}`);

      return NextResponse.json({ 
        success: true, 
        message: `สำรองข้อมูลระบบทั้งหมดสำเร็จ: "${backupName}"` 
      });
    }

    // --- Action: RESTORE (Full database wipe & reload) ---
    if (action === 'restore') {
      if (!filename) {
        return NextResponse.json({ success: false, error: 'กรุณาระบุชื่อไฟล์ที่ต้องการกู้คืน' }, { status: 400 });
      }

      const filePath = path.join(backupsDir, filename);
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ success: false, error: 'ไม่พบไฟล์สำรองนี้บนเซิร์ฟเวอร์' }, { status: 404 });
      }

      console.log(`📤 Restoring full system from file: ${filename}`);
      const fileData = fs.readFileSync(filePath, 'utf-8');
      const backupData = JSON.parse(fileData);
      const t = backupData.tables;

      // -------------------------------------------------------------
      // 1. WIPE ENTIRE DATABASE IN ORDER
      // -------------------------------------------------------------
      console.log('⚡ Wiping current database...');

      await supabase.from('orders').update({ payment_id: null }).gt('id', '00000000-0000-0000-0000-000000000000');

      const tablesToWipe = [...TABLES_IN_ORDER].reverse();
      for (const table of tablesToWipe) {
        if (table === 'ingredient_stock_balances') {
          await supabase.from(table).delete().gt('ingredient_id', '00000000-0000-0000-0000-000000000000');
        } else {
          await supabase.from(table).delete().gt('id', '00000000-0000-0000-0000-000000000000');
        }
      }

      const { data: currentUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      if (currentUsers?.users) {
        for (const u of currentUsers.users) {
          await supabase.auth.admin.deleteUser(u.id);
        }
      }

      // -------------------------------------------------------------
      // 2. RESTORE AUTH USERS
      // -------------------------------------------------------------
      const backupUsers = backupData.authUsers || [];
      for (const u of backupUsers) {
        console.log(`👤 Recreating user: ${u.email}`);
        const { error } = await supabase.auth.admin.createUser({
          id: u.id,
          email: u.email,
          password: 'password123',
          email_confirm: true,
          user_metadata: u.user_metadata
        });
        if (error) {
          console.error(`Failed to recreate auth user ${u.email}:`, error.message);
        }
      }

      // -------------------------------------------------------------
      // 3. RESTORE TABLES IN ORDER
      // -------------------------------------------------------------
      const restoreTable = async (tableName: string, rows: any[]) => {
        if (!rows || rows.length === 0) return;
        console.log(`📦 Restoring table: ${tableName} (${rows.length} rows)`);

        const sanitizedRows = rows.map(r => {
          const rowObj = { ...r };
          if (rowObj.options !== undefined) rowObj.options = safeParse(rowObj.options);
          if (rowObj.config !== undefined) rowObj.config = safeParse(rowObj.config);
          if (rowObj.access_tokens !== undefined) rowObj.access_tokens = safeParse(rowObj.access_tokens);
          if (rowObj.vat_snapshot !== undefined) rowObj.vat_snapshot = safeParse(rowObj.vat_snapshot);
          if (rowObj.promotion_snapshot !== undefined) rowObj.promotion_snapshot = safeParse(rowObj.promotion_snapshot);
          if (rowObj.toppings_snapshot !== undefined) rowObj.toppings_snapshot = safeParse(rowObj.toppings_snapshot);
          if (rowObj.gallery !== undefined) rowObj.gallery = safeParse(rowObj.gallery);
          if (rowObj.features !== undefined) rowObj.features = safeParse(rowObj.features);
          return rowObj;
        });

        const { error } = await supabase.from(tableName).upsert(sanitizedRows);
        if (error) {
          console.error(`❌ Error restoring ${tableName}:`, error);
          throw error;
        }
      };

      await restoreTable('brands', t.brands);
      await restoreTable('profiles', t.profiles);

      await restoreTable('categories', t.categories);
      await restoreTable('master_categories', t.master_categories);
      await restoreTable('topping_groups', t.topping_groups);
      await restoreTable('measurement_units', t.measurement_units);
      await restoreTable('ingredient_categories', t.ingredient_categories);

      await restoreTable('products', t.products);
      await restoreTable('product_master', t.product_master);
      await restoreTable('topping_items', t.topping_items);
      await restoreTable('ingredients', t.ingredients);

      await restoreTable('product_topping_groups', t.product_topping_groups);
      await restoreTable('ingredient_units', t.ingredient_units);
      await restoreTable('product_recipes', t.product_recipes);
      await restoreTable('ingredient_receipts', t.ingredient_receipts);

      await restoreTable('product_recipe_items', t.product_recipe_items);
      await restoreTable('ingredient_receipt_items', t.ingredient_receipt_items);

      await restoreTable('discounts', t.discounts);
      await restoreTable('discount_products', t.discount_products);

      await restoreTable('stock', t.stock);
      await restoreTable('ingredient_stock_balances', t.ingredient_stock_balances);
      await restoreTable('tables', t.tables);
      await restoreTable('banners', t.banners);

      if (t.orders && t.orders.length > 0) {
        const ordersNoPayment = t.orders.map((o: any) => ({
          ...o,
          payment_id: null
        }));
        await restoreTable('orders', ordersNoPayment);
      }

      await restoreTable('pai_orders', t.pai_orders);

      if (t.orders && t.orders.length > 0) {
        const ordersWithPayment = t.orders.filter((o: any) => o.payment_id);
        if (ordersWithPayment.length > 0) {
          const { error: orderUpdateErr } = await supabase.from('orders').upsert(ordersWithPayment);
          if (orderUpdateErr) throw orderUpdateErr;
        }
      }

      await restoreTable('order_items', t.order_items);
      await restoreTable('order_item_toppings', t.order_item_toppings);

      await restoreTable('stock_logs', t.stock_logs);
      await restoreTable('ingredient_stock_movements', t.ingredient_stock_movements);
      await restoreTable('cashier_shifts', t.cashier_shifts);

      await restoreTable('coin_logs', t.coin_logs);
      await restoreTable('payment_logs', t.payment_logs);
      await restoreTable('profile_fcm_tokens', t.profile_fcm_tokens);
      await restoreTable('invitation_logs', t.invitation_logs);

      await restoreTable('dashboard_daily_sales', t.dashboard_daily_sales);
      await restoreTable('dashboard_hourly_sales', t.dashboard_hourly_sales);
      await restoreTable('dashboard_product_stats', t.dashboard_product_stats);
      await restoreTable('dashboard_payment_stats', t.dashboard_payment_stats);
      await restoreTable('dashboard_table_stats', t.dashboard_table_stats);
      await restoreTable('dashboard_topping_stats', t.dashboard_topping_stats);
      await restoreTable('dashboard_cashier_stats', t.dashboard_cashier_stats);

      console.log('✅ Full system database restore completed.');
      return NextResponse.json({ 
        success: true, 
        message: `ย้อนกลับฐานข้อมูลสำเร็จ! คืนค่าระบบกลับสู่สถานะ: "${backupData.name}"` 
      });
    }

    // --- Action: DELETE (Delete backup file from server) ---
    if (action === 'delete') {
      if (!filename) {
        return NextResponse.json({ success: false, error: 'กรุณาระบุไฟล์ที่ต้องการลบ' }, { status: 400 });
      }

      const filePath = path.join(backupsDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return NextResponse.json({ success: true, message: 'ลบไฟล์สำรองข้อมูลออกจากเซิร์ฟเวอร์เรียบร้อยแล้ว' });
      }

      return NextResponse.json({ success: false, error: 'ไม่พบไฟล์สำรองนี้' }, { status: 404 });
    }

    return NextResponse.json({ success: false, error: 'การกระทำไม่ถูกต้อง' }, { status: 400 });
  } catch (error: any) {
    console.error('❌ [Backup/Restore Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
