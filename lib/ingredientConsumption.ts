type SoldOrderItem = {
  id?: string | null;
  order_id?: string | null;
  product_id?: string | null;
  quantity?: number | string | null;
  qty?: number | string | null;
  variant?: string | null;
  status?: string | null;
};

type RecipeItem = {
  id: string;
  ingredient_id: string;
  quantity_base: number | string;
  waste_percent: number | string | null;
};

type Recipe = {
  id: string;
  product_id: string;
  variant_key: string;
  yield_quantity: number | string;
  effective_from: string;
  effective_to: string | null;
  product_recipe_items: RecipeItem[] | null;
};

type ApplyIngredientConsumptionArgs = {
  brandId: string;
  paymentId: string;
  orderId: string;
  items: SoldOrderItem[];
  saleTime: string;
  performedBy?: string | null;
};

const normalizeVariant = (value: unknown) => {
  const variant = String(value || 'normal').toLowerCase();
  return ['normal', 'special', 'jumbo'].includes(variant)
    ? variant
    : 'normal';
};

/**
 * Deducts recipe ingredients for a completed payment.
 *
 * Each movement has a deterministic source_event_key, so retrying the same
 * PAYMENT ticket is safe and cannot deduct the same recipe item twice.
 */
export async function applyIngredientConsumption(
  supabase: any,
  args: ApplyIngredientConsumptionArgs,
) {
  const soldItems = (args.items || []).filter((item) => {
    const quantity = Number(item.quantity ?? item.qty ?? 0);
    return (
      Boolean(item.id) &&
      Boolean(item.product_id) &&
      item.status !== 'cancelled' &&
      Number.isFinite(quantity) &&
      quantity > 0
    );
  });

  if (soldItems.length === 0) {
    return { movementCount: 0, skippedItemCount: 0 };
  }

  const productIds = Array.from(
    new Set(soldItems.map((item) => String(item.product_id))),
  );

  const { data, error } = await supabase
    .from('product_recipes')
    .select(
      `
        id,
        product_id,
        variant_key,
        yield_quantity,
        effective_from,
        effective_to,
        product_recipe_items (
          id,
          ingredient_id,
          quantity_base,
          waste_percent
        )
      `,
    )
    .eq('brand_id', args.brandId)
    .in('product_id', productIds)
    .lte('effective_from', args.saleTime)
    .or(`effective_to.is.null,effective_to.gt.${args.saleTime}`)
    .order('effective_from', { ascending: false });

  if (error) throw error;

  const recipes = (data || []) as Recipe[];
  const movements: Record<string, unknown>[] = [];
  let skippedItemCount = 0;

  for (const soldItem of soldItems) {
    const productId = String(soldItem.product_id);
    const variant = normalizeVariant(soldItem.variant);
    const candidates = recipes.filter(
      (recipe) => String(recipe.product_id) === productId,
    );
    const recipe =
      candidates.find((candidate) => candidate.variant_key === variant) ||
      candidates.find((candidate) => candidate.variant_key === 'normal');

    if (!recipe || !recipe.product_recipe_items?.length) {
      skippedItemCount += 1;
      continue;
    }

    const soldQuantity = Number(soldItem.quantity ?? soldItem.qty);
    const yieldQuantity = Number(recipe.yield_quantity || 1);
    if (!Number.isFinite(yieldQuantity) || yieldQuantity <= 0) {
      throw new Error(`Invalid recipe yield for product ${productId}`);
    }

    for (const recipeItem of recipe.product_recipe_items) {
      const baseQuantity = Number(recipeItem.quantity_base);
      const wastePercent = Number(recipeItem.waste_percent || 0);
      const consumedQuantity =
        (baseQuantity * soldQuantity * (1 + wastePercent / 100)) /
        yieldQuantity;

      if (!Number.isFinite(consumedQuantity) || consumedQuantity <= 0) {
        continue;
      }

      movements.push({
        brand_id: args.brandId,
        ingredient_id: recipeItem.ingredient_id,
        quantity_delta: -consumedQuantity,
        movement_type: 'SALE_CONSUMPTION',
        order_id: soldItem.order_id || args.orderId,
        order_item_id: soldItem.id,
        recipe_item_id: recipeItem.id,
        source_event_key:
          `SALE:${args.paymentId}:${soldItem.id}:${recipeItem.id}`,
        performed_by: args.performedBy || null,
        note: `Auto deduct from recipe ${recipe.id}`,
        created_at: args.saleTime,
      });
    }
  }

  if (movements.length === 0) {
    return { movementCount: 0, skippedItemCount };
  }

  const { error: movementError } = await supabase
    .from('ingredient_stock_movements')
    .upsert(movements, {
      onConflict: 'source_event_key',
      ignoreDuplicates: true,
    });

  if (movementError) throw movementError;

  return {
    movementCount: movements.length,
    skippedItemCount,
  };
}
