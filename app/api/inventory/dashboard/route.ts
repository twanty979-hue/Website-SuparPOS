import { NextResponse } from 'next/server';
import dayjs from 'dayjs';
import { getAuthContext } from '@/lib/authHelper';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    const { supabase, brandId } = await getAuthContext(request);
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'products'; // 'products' or 'ingredients'
    const viewMode = url.searchParams.get('view_mode') || 'last7days';
    const customStartDate = url.searchParams.get('start_date');
    const customEndDate = url.searchParams.get('end_date');

    // 1. Determine effective plan & allowed max days
    const { data: brandRow } = await supabase
      .from('brands')
      .select('plan, config')
      .eq('id', brandId)
      .maybeSingle();

    const plan = (brandRow?.plan || 'free').toString().toLowerCase().trim();
    const effectivePlan = plan === 'ultimate' ? 'ultimate' : plan === 'pro' ? 'pro' : 'free';
    const maxDaysAllowed = effectivePlan === 'free' ? 30 : 0; // 0 = unlimited

    // 2. Compute date range
    const now = dayjs();
    let startDate = now.subtract(6, 'day').startOf('day');
    let endDate = now.endOf('day');

    if (viewMode === 'today') {
      startDate = now.startOf('day');
      endDate = now.endOf('day');
    } else if (viewMode === 'last7days' || viewMode === '7days') {
      startDate = now.subtract(6, 'day').startOf('day');
      endDate = now.endOf('day');
    } else if (viewMode === 'last30days' || viewMode === '30days') {
      startDate = now.subtract(29, 'day').startOf('day');
      endDate = now.endOf('day');
    } else if (viewMode === 'last60days' || viewMode === '60days') {
      startDate = now.subtract(59, 'day').startOf('day');
      endDate = now.endOf('day');
    } else if (viewMode === 'last90days' || viewMode === '90days') {
      startDate = now.subtract(89, 'day').startOf('day');
      endDate = now.endOf('day');
    } else if (viewMode === 'thisMonth' || viewMode === 'this_month') {
      startDate = now.startOf('month');
      endDate = now.endOf('day');
    } else if (viewMode === 'lastMonth' || viewMode === 'last_month') {
      startDate = now.subtract(1, 'month').startOf('month');
      endDate = now.subtract(1, 'month').endOf('month');
    } else if (viewMode === 'custom' && customStartDate && customEndDate) {
      startDate = dayjs(customStartDate).startOf('day');
      endDate = dayjs(customEndDate).endOf('day');
    }

    // Apply plan limit
    if (maxDaysAllowed > 0) {
      const earliestAllowed = now.subtract(maxDaysAllowed - 1, 'day').startOf('day');
      if (startDate.isBefore(earliestAllowed)) {
        startDate = earliestAllowed;
      }
    }

    const startIso = startDate.toISOString();
    const endIso = endDate.toISOString();
    const startDateStr = startDate.format('YYYY-MM-DD');
    const endDateStr = endDate.format('YYYY-MM-DD');

    const brandIngredientImages = (brandRow?.config?.ingredient_images || {}) as Record<string, string>;

    // =========================================================================
    // BRANCH A: PRODUCTS DASHBOARD (แดชบอร์ดสินค้าสำเร็จรูป)
    // =========================================================================
    if (type === 'products') {
      // 1. Fetch products & retail stock
      const [productsRes, stockRes, orderItemsRes, stockLogsRes] = await Promise.all([
        supabase
          .from('products')
          .select('id, name, price, cost_price, image_url, category_id, is_active, stock_qty')
          .eq('brand_id', brandId)
          .is('deleted_at', null),

        supabase
          .from('stock')
          .select('id, product_id, quantity, min_quantity, product_master(id, name, price, cost_price, image_url, category_id)')
          .eq('brand_id', brandId),

        supabase
          .from('order_items')
          .select('id, order_id, product_id, product_name, quantity, price, cost, status, created_at, orders!inner(id, brand_id, status, created_at)')
          .eq('orders.brand_id', brandId)
          .neq('orders.status', 'cancelled')
          .neq('status', 'cancelled')
          .gte('created_at', startIso)
          .lte('created_at', endIso),

        supabase
          .from('stock_logs')
          .select('id, change_amount, action_type, note, created_at, product_master(name, image_url)')
          .eq('brand_id', brandId)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      const productsList = productsRes.data || [];
      const stockList = stockRes.data || [];
      const orderItems = orderItemsRes.data || [];
      const stockLogs = stockLogsRes.data || [];

      // Calculate Product Stock Metrics
      let totalProducts = productsList.length;
      let totalInventoryItems = 0;
      let totalInventoryValue = 0;
      let lowStockCount = 0;
      let outOfStockCount = 0;
      const lowStockAlerts: any[] = [];

      // Combine products stock information
      const productMap: Record<string, any> = {};
      for (const p of productsList) {
        productMap[p.id] = {
          id: p.id,
          name: p.name,
          price: Number(p.price || 0),
          cost: Number(p.cost_price || p.price || 0),
          image_url: p.image_url,
          category_id: p.category_id,
          stock: Number(p.stock_qty || 0),
          is_active: p.is_active !== false,
        };
      }

      // If separate stock table has rows, merge them
      for (const s of stockList) {
        const pm = s.product_master as any;
        const pid = s.product_id || pm?.id;
        const qty = Number(s.quantity || 0);
        const minQty = Number(s.min_quantity || 5);
        if (pid && productMap[pid]) {
          productMap[pid].stock = qty;
          productMap[pid].min_stock = minQty;
        } else if (pid) {
          productMap[pid] = {
            id: pid,
            name: pm?.name || 'สินค้า',
            price: Number(pm?.price || 0),
            cost: Number(pm?.cost_price || pm?.price || 0),
            image_url: pm?.image_url,
            category_id: pm?.category_id,
            stock: qty,
            min_stock: minQty,
            is_active: true,
          };
        }
      }

      const allCombinedProducts = Object.values(productMap);
      totalProducts = allCombinedProducts.length;

      for (const p of allCombinedProducts) {
        const qty = p.stock || 0;
        const cost = p.cost || p.price || 0;
        const minStock = p.min_stock || 5;

        if (qty > 0) {
          totalInventoryItems += qty;
          totalInventoryValue += qty * cost;
        }

        if (qty <= 0) {
          outOfStockCount++;
          lowStockAlerts.push({
            id: p.id,
            name: p.name,
            current_stock: qty,
            min_stock: minStock,
            price: p.price,
            image_url: p.image_url,
            status: 'OUT_OF_STOCK',
          });
        } else if (qty <= minStock) {
          lowStockCount++;
          lowStockAlerts.push({
            id: p.id,
            name: p.name,
            current_stock: qty,
            min_stock: minStock,
            price: p.price,
            image_url: p.image_url,
            status: 'LOW_STOCK',
          });
        }
      }

      // Aggregate Sales & Top Selling Products
      let totalSoldUnits = 0;
      let totalSoldRevenue = 0;
      const salesByProduct: Record<string, { id: string; name: string; quantity: number; revenue: number; image_url: string; current_stock: number }> = {};
      const salesByDate: Record<string, { date: string; sold_qty: number; revenue: number; orders_count: number }> = {};
      const seenOrdersPerDay: Record<string, Set<string>> = {};

      for (const item of orderItems) {
        const pid = item.product_id || item.product_name || 'unknown';
        const qty = Number(item.quantity || 1);
        const price = Number(item.price || 0);
        const rev = qty * price;
        const pInfo = productMap[item.product_id];

        totalSoldUnits += qty;
        totalSoldRevenue += rev;

        if (!salesByProduct[pid]) {
          salesByProduct[pid] = {
            id: item.product_id || pid,
            name: item.product_name || pInfo?.name || 'สินค้า',
            quantity: 0,
            revenue: 0,
            image_url: pInfo?.image_url || null,
            current_stock: pInfo?.stock ?? 0,
          };
        }
        salesByProduct[pid].quantity += qty;
        salesByProduct[pid].revenue += rev;

        // Daily trend
        const dayStr = dayjs(item.created_at).format('YYYY-MM-DD');
        if (!salesByDate[dayStr]) {
          salesByDate[dayStr] = { date: dayStr, sold_qty: 0, revenue: 0, orders_count: 0 };
          seenOrdersPerDay[dayStr] = new Set();
        }
        salesByDate[dayStr].sold_qty += qty;
        salesByDate[dayStr].revenue += rev;
        if (item.order_id) {
          seenOrdersPerDay[dayStr].add(item.order_id);
          salesByDate[dayStr].orders_count = seenOrdersPerDay[dayStr].size;
        }
      }

      const topSellingProducts = Object.values(salesByProduct)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 15);

      // Sort daily sales chronologically
      const dailySalesTrend = Object.values(salesByDate).sort((a, b) => a.date.localeCompare(b.date));

      // Sort low stock alerts (out of stock first, then lowest stock)
      lowStockAlerts.sort((a, b) => a.current_stock - b.current_stock);

      return NextResponse.json(
        {
          success: true,
          type: 'products',
          date_range: {
            start: startDateStr,
            end: endDateStr,
            view_mode: viewMode,
          },
          effective_plan: effectivePlan,
          max_days_allowed: maxDaysAllowed,
          summary: {
            total_products: totalProducts,
            total_inventory_items: totalInventoryItems,
            total_inventory_value: totalInventoryValue,
            total_sold_units: totalSoldUnits,
            total_sold_revenue: totalSoldRevenue,
            low_stock_count: lowStockCount,
            out_of_stock_count: outOfStockCount,
          },
          top_selling_products: topSellingProducts,
          daily_sales_trend: dailySalesTrend,
          low_stock_alerts: lowStockAlerts.slice(0, 20),
          recent_movements: stockLogs,
        },
        { headers: corsHeaders },
      );
    }

    // =========================================================================
    // BRANCH B: INGREDIENTS DASHBOARD (แดชบอร์ดวัตถุดิบ & การใช้ตามสูตร)
    // =========================================================================
    if (type === 'ingredients') {
      const [ingredientsRes, movementsRes, recipesRes, orderItemsRes] = await Promise.all([
        supabase
          .from('ingredients')
          .select(`
            id, name, sku, category, category_id, base_unit, minimum_stock, is_active,
            ingredient_units (purchase_price, conversion_to_base, is_default_purchase_unit)
          `)
          .eq('brand_id', brandId)
          .eq('is_active', true),

        supabase
          .from('ingredient_stock_movements')
          .select(`
            id, ingredient_id, quantity_delta, movement_type, note, created_at, order_id,
            ingredients!inner(name, base_unit, brand_id)
          `)
          .eq('brand_id', brandId)
          .eq('ingredients.brand_id', brandId)
          .gte('created_at', startIso)
          .lte('created_at', endIso)
          .order('created_at', { ascending: false }),

        supabase
          .from('product_recipes')
          .select(`
            id, product_id, variant_key, yield_quantity,
            products(id, name, image_url),
            product_recipe_items(ingredient_id, quantity_base, waste_percent)
          `)
          .eq('brand_id', brandId)
          .eq('is_active', true)
          .is('effective_to', null),

        supabase
          .from('order_items')
          .select('id, product_id, product_name, quantity, price, created_at, orders!inner(id, brand_id, status)')
          .eq('orders.brand_id', brandId)
          .neq('orders.status', 'cancelled')
          .gte('created_at', startIso)
          .lte('created_at', endIso),
      ]);

      const ingredientsList = ingredientsRes.data || [];
      const movements = movementsRes.data || [];
      const recipes = recipesRes.data || [];
      const orderItems = orderItemsRes.data || [];

      // Calculate on-hand stock and default unit cost
      const ingredientMap: Record<string, any> = {};
      let totalIngredients = ingredientsList.length;
      let totalIngredientValue = 0;
      let lowStockCount = 0;
      let outOfStockCount = 0;
      const lowStockAlerts: any[] = [];

      for (const ing of ingredientsList) {
        const units = (ing.ingredient_units as any[]) || [];
        let unitCost = 0;
        const defaultUnit = units.find((u) => u.is_default_purchase_unit) || units[0];
        if (defaultUnit) {
          const p = Number(defaultUnit.purchase_price || 0);
          const c = Number(defaultUnit.conversion_to_base || 1);
          if (c > 0) unitCost = p / c;
        }

        ingredientMap[ing.id] = {
          id: ing.id,
          name: ing.name,
          category: ing.category || 'ทั่วไป',
          base_unit: ing.base_unit || 'หน่วย',
          minimum_stock: Number(ing.minimum_stock || 0),
          unit_cost: unitCost,
          image_url: brandIngredientImages[ing.id] || null,
          current_stock: 0,
        };
      }

      // Compute current stock by aggregating all movements or taking snapshots
      // To get real current stock, query movements up to now for this brand
      const { data: allMovementsUpToNow } = await supabase
        .from('ingredient_stock_movements')
        .select('ingredient_id, quantity_delta')
        .eq('brand_id', brandId);

      if (allMovementsUpToNow) {
        for (const m of allMovementsUpToNow) {
          if (ingredientMap[m.ingredient_id]) {
            ingredientMap[m.ingredient_id].current_stock += Number(m.quantity_delta || 0);
          }
        }
      }

      for (const ing of Object.values(ingredientMap)) {
        const stock = ing.current_stock || 0;
        const minStock = ing.minimum_stock || 0;
        const val = stock > 0 ? stock * (ing.unit_cost || 0) : 0;
        totalIngredientValue += val;

        if (stock <= 0) {
          outOfStockCount++;
          lowStockAlerts.push({
            id: ing.id,
            name: ing.name,
            current_stock: stock,
            minimum_stock: minStock,
            base_unit: ing.base_unit,
            image_url: ing.image_url,
            category: ing.category,
            status: 'OUT_OF_STOCK',
          });
        } else if (stock <= minStock) {
          lowStockCount++;
          lowStockAlerts.push({
            id: ing.id,
            name: ing.name,
            current_stock: stock,
            minimum_stock: minStock,
            base_unit: ing.base_unit,
            image_url: ing.image_url,
            category: ing.category,
            status: 'LOW_STOCK',
          });
        }
      }

      // Movement Analytics in Selected Date Range
      let totalConsumedQty = 0;
      let totalWasteQty = 0;
      let totalWasteCost = 0;
      let totalReceivedQty = 0;

      const consumedByIngredient: Record<string, { id: string; name: string; base_unit: string; quantity: number; cost_value: number; image_url: string; category: string }> = {};
      const wasteByIngredient: Record<string, { id: string; name: string; base_unit: string; quantity: number; cost_value: number; image_url: string; reasons: string[] }> = {};
      const dailyTrend: Record<string, { date: string; consumed_qty: number; waste_qty: number; received_qty: number }> = {};

      for (const m of movements) {
        const iid = m.ingredient_id;
        const delta = Number(m.quantity_delta || 0);
        const type = (m.movement_type || '').toUpperCase();
        const ing = ingredientMap[iid];
        const ingRaw = Array.isArray(m.ingredients) ? m.ingredients[0] : (m.ingredients as any);
        const unitCost = ing?.unit_cost || 0;
        const dayStr = dayjs(m.created_at).format('YYYY-MM-DD');

        if (!dailyTrend[dayStr]) {
          dailyTrend[dayStr] = { date: dayStr, consumed_qty: 0, waste_qty: 0, received_qty: 0 };
        }

        if (type === 'ORDER' || type === 'USAGE' || (delta < 0 && type !== 'WASTE' && type !== 'ADJUST_OUT')) {
          const used = Math.abs(delta);
          totalConsumedQty += used;
          dailyTrend[dayStr].consumed_qty += used;

          if (!consumedByIngredient[iid]) {
            consumedByIngredient[iid] = {
              id: iid,
              name: ing?.name || ingRaw?.name || 'วัตถุดิบ',
              base_unit: ing?.base_unit || ingRaw?.base_unit || 'หน่วย',
              quantity: 0,
              cost_value: 0,
              image_url: ing?.image_url || null,
              category: ing?.category || 'ทั่วไป',
            };
          }
          consumedByIngredient[iid].quantity += used;
          consumedByIngredient[iid].cost_value += used * unitCost;
        } else if (type === 'WASTE') {
          const wasted = Math.abs(delta);
          totalWasteQty += wasted;
          totalWasteCost += wasted * unitCost;
          dailyTrend[dayStr].waste_qty += wasted;

          if (!wasteByIngredient[iid]) {
            wasteByIngredient[iid] = {
              id: iid,
              name: ing?.name || ingRaw?.name || 'วัตถุดิบ',
              base_unit: ing?.base_unit || ingRaw?.base_unit || 'หน่วย',
              quantity: 0,
              cost_value: 0,
              image_url: ing?.image_url || null,
              reasons: [],
            };
          }
          wasteByIngredient[iid].quantity += wasted;
          wasteByIngredient[iid].cost_value += wasted * unitCost;
          if (m.note && typeof m.note === 'string' && m.note.trim() && !wasteByIngredient[iid].reasons.includes(m.note.trim())) {
            wasteByIngredient[iid].reasons.push(m.note.trim());
          }
        } else if (type === 'RECEIVE' || delta > 0) {
          totalReceivedQty += Math.abs(delta);
          dailyTrend[dayStr].received_qty += Math.abs(delta);
        }
      }

      const topConsumedIngredients = Object.values(consumedByIngredient)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 15);

      const topWastedIngredients = Object.values(wasteByIngredient)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);

      const dailyConsumptionTrend = Object.values(dailyTrend).sort((a, b) => a.date.localeCompare(b.date));

      // =======================================================================
      // Product-to-Ingredient Usage ("สินค้าตัวไหนใช้อะไรไปเยอะ วัตถุดิบไปเยอะ")
      // =======================================================================
      // Build recipe map: product_id -> items: [{ ingredient_id, quantity_base, waste_percent }]
      const recipeMap: Record<string, { productName: string; imageUrl?: string; items: any[] }> = {};
      for (const r of recipes) {
        const prod = r.products as any;
        const pid = r.product_id;
        const items = (r.product_recipe_items as any[]) || [];
        recipeMap[pid] = {
          productName: prod?.name || 'เมนู',
          imageUrl: prod?.image_url || null,
          items: items.map((it) => ({
            ingredient_id: it.ingredient_id,
            quantity_base: Number(it.quantity_base || 0),
            waste_percent: Number(it.waste_percent || 0),
          })),
        };
      }

      // Count sold quantities of each product in the period
      const productSalesCount: Record<string, { productName: string; soldQty: number; imageUrl?: string | null }> = {};
      for (const oi of orderItems) {
        const pid = oi.product_id;
        if (!pid) continue;
        const q = Number(oi.quantity || 1);
        if (!productSalesCount[pid]) {
          productSalesCount[pid] = {
            productName: oi.product_name || recipeMap[pid]?.productName || 'เมนู',
            soldQty: 0,
            imageUrl: recipeMap[pid]?.imageUrl || null,
          };
        }
        productSalesCount[pid].soldQty += q;
      }

      // 1. By Product: For each sold product with a recipe, breakdown how much of each ingredient it used
      const usageByProductList: any[] = [];
      // 2. By Ingredient: For each ingredient, breakdown which products consumed it
      const ingredientConsumersMap: Record<string, { ingredientName: string; baseUnit: string; imageUrl?: string; totalUsed: number; products: any[] }> = {};

      for (const [pid, saleInfo] of Object.entries(productSalesCount)) {
        const recipe = recipeMap[pid];
        if (!recipe || recipe.items.length === 0) continue;

        const consumedIngredientsInProduct: any[] = [];
        for (const rItem of recipe.items) {
          const ing = ingredientMap[rItem.ingredient_id];
          if (!ing) continue;
          const wasteFactor = 1 + (rItem.waste_percent || 0) / 100;
          const totalIngredientUsed = saleInfo.soldQty * rItem.quantity_base * wasteFactor;

          consumedIngredientsInProduct.push({
            ingredient_id: ing.id,
            ingredient_name: ing.name,
            base_unit: ing.base_unit,
            image_url: ing.image_url,
            amount_per_dish: rItem.quantity_base,
            total_used: totalIngredientUsed,
          });

          // Add to ingredient consumers breakdown
          if (!ingredientConsumersMap[ing.id]) {
            ingredientConsumersMap[ing.id] = {
              ingredientName: ing.name,
              baseUnit: ing.base_unit,
              imageUrl: ing.image_url,
              totalUsed: 0,
              products: [],
            };
          }
          ingredientConsumersMap[ing.id].totalUsed += totalIngredientUsed;
          ingredientConsumersMap[ing.id].products.push({
            product_id: pid,
            product_name: saleInfo.productName,
            sold_qty: saleInfo.soldQty,
            image_url: saleInfo.imageUrl,
            consumed_amount: totalIngredientUsed,
          });
        }

        usageByProductList.push({
          product_id: pid,
          product_name: saleInfo.productName,
          sold_qty: saleInfo.soldQty,
          image_url: saleInfo.imageUrl,
          ingredients: consumedIngredientsInProduct.sort((a, b) => b.total_used - a.total_used),
        });
      }

      usageByProductList.sort((a, b) => b.sold_qty - a.sold_qty);

      const usageByIngredientList = Object.values(ingredientConsumersMap)
        .map((ic) => ({
          ingredient_name: ic.ingredientName,
          base_unit: ic.baseUnit,
          image_url: ic.imageUrl,
          total_used: ic.totalUsed,
          top_products: ic.products.sort((a, b) => b.consumed_amount - a.consumed_amount).slice(0, 5),
        }))
        .sort((a, b) => b.total_used - a.total_used);

      // Movements with images mapped
      const recentMovementsWithImages = movements.slice(0, 15).map((m: any) => {
        const ingRaw = Array.isArray(m.ingredients) ? m.ingredients[0] : (m.ingredients as any);
        return {
          id: m.id,
          ingredient_id: m.ingredient_id,
          name: ingRaw?.name || ingredientMap[m.ingredient_id]?.name || 'วัตถุดิบ',
          base_unit: ingRaw?.base_unit || ingredientMap[m.ingredient_id]?.base_unit || 'หน่วย',
          image_url: ingredientMap[m.ingredient_id]?.image_url || null,
          delta: Number(m.quantity_delta || 0),
          movement_type: m.movement_type,
          note: m.note,
          created_at: m.created_at,
          order_id: m.order_id,
        };
      });

      return NextResponse.json(
        {
          success: true,
          type: 'ingredients',
          date_range: {
            start: startDateStr,
            end: endDateStr,
            view_mode: viewMode,
          },
          effective_plan: effectivePlan,
          max_days_allowed: maxDaysAllowed,
          summary: {
            total_ingredients: totalIngredients,
            total_ingredient_value: totalIngredientValue,
            total_consumed_qty: totalConsumedQty,
            total_waste_qty: totalWasteQty,
            total_waste_cost: totalWasteCost,
            total_received_qty: totalReceivedQty,
            low_stock_count: lowStockCount,
            out_of_stock_count: outOfStockCount,
          },
          top_consumed_ingredients: topConsumedIngredients,
          product_ingredient_usage: {
            by_product: usageByProductList.slice(0, 15),
            by_ingredient: usageByIngredientList.slice(0, 15),
          },
          waste_breakdown: topWastedIngredients,
          daily_consumption_trend: dailyConsumptionTrend,
          low_stock_alerts: lowStockAlerts.sort((a, b) => a.current_stock - b.current_stock).slice(0, 20),
          recent_movements: recentMovementsWithImages,
        },
        { headers: corsHeaders },
      );
    }

    return NextResponse.json({ success: false, error: 'Unknown dashboard type' }, { status: 400, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
  }
}
