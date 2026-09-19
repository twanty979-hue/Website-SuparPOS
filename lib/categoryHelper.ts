import type { SupabaseClient } from '@supabase/supabase-js';

export async function deduplicateAndCleanCategories(
  supabase: SupabaseClient,
  brandId: string,
  categories: any[]
): Promise<any[]> {
  if (!categories || categories.length <= 1) {
    return categories || [];
  }

  const seen = new Map<string, any>();
  const duplicateIdsToDelete: string[] = [];
  const remappings: { fromId: string; toId: string }[] = [];

  for (const cat of categories) {
    const normName = (cat.name || '').trim().toLowerCase();
    if (!normName) continue;

    if (!seen.has(normName)) {
      seen.set(normName, cat);
    } else {
      const canonical = seen.get(normName)!;
      duplicateIdsToDelete.push(String(cat.id));
      remappings.push({ fromId: String(cat.id), toId: String(canonical.id) });
    }
  }

  if (duplicateIdsToDelete.length > 0) {
    try {
      // 1. Remap products using duplicate category IDs
      for (const map of remappings) {
        await supabase
          .from('products')
          .update({ category_id: map.toId })
          .eq('brand_id', brandId)
          .eq('category_id', map.fromId);
      }

      // 2. Delete redundant duplicate category records
      await supabase
        .from('categories')
        .delete()
        .eq('brand_id', brandId)
        .in('id', duplicateIdsToDelete);
    } catch (err) {
      console.error('Error cleaning up duplicate categories:', err);
    }
  }

  return Array.from(seen.values());
}
