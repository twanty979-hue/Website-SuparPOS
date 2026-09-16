import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

export type PlanKey = 'free' | 'basic' | 'pro' | 'ultimate';

export type PlanPermissions = {
  max_days: number;
  allow_advanced: boolean;
  receipt_max_days: number;
  max_food_items: number;
  max_products: number;
  max_tables: number;
};

export const DEFAULT_PLAN_PERMISSIONS: Record<PlanKey, PlanPermissions> = {
  free: {
    max_days: 30,
    allow_advanced: false,
    receipt_max_days: 7,
    max_food_items: 50,
    max_products: 50,
    max_tables: 10,
  },
  basic: {
    max_days: 0,
    allow_advanced: false,
    receipt_max_days: 0,
    max_food_items: 0,
    max_products: 0,
    max_tables: 0,
  },
  pro: {
    max_days: 0,
    allow_advanced: true,
    receipt_max_days: 0,
    max_food_items: 0,
    max_products: 0,
    max_tables: 0,
  },
  ultimate: {
    max_days: 0,
    allow_advanced: true,
    receipt_max_days: 0,
    max_food_items: 0,
    max_products: 0,
    max_tables: 0,
  },
};

const PLAN_KEYS = new Set<PlanKey>(['free', 'basic', 'pro', 'ultimate']);

const toLimit = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : fallback;
};

export function normalizePlan(value: unknown): PlanKey {
  const normalized = String(value || 'free').trim().toLowerCase();
  if (normalized === 'enterprise') return 'ultimate';
  return PLAN_KEYS.has(normalized as PlanKey) ? (normalized as PlanKey) : 'free';
}

export function calculateEffectivePlan(brand: Record<string, unknown> | null | undefined): PlanKey {
  const configuredPlan = normalizePlan(brand?.plan);
  if (configuredPlan === 'free') return 'free';

  const expiryKey = `expiry_${configuredPlan}`;
  const rawExpiry = brand?.[expiryKey];
  if (!rawExpiry) return 'free';

  const expiry = new Date(String(rawExpiry).replace(' ', 'T'));
  return Number.isNaN(expiry.getTime()) || expiry <= new Date()
    ? 'free'
    : configuredPlan;
}

export function mergePlanPermissions(plan: PlanKey, saved: unknown): PlanPermissions {
  const fallback = DEFAULT_PLAN_PERMISSIONS[plan];
  const record = saved && typeof saved === 'object'
    ? (saved as Record<string, unknown>)
    : {};

  return {
    max_days: toLimit(record.max_days, fallback.max_days),
    allow_advanced: typeof record.allow_advanced === 'boolean'
      ? record.allow_advanced
      : fallback.allow_advanced,
    receipt_max_days: toLimit(record.receipt_max_days, fallback.receipt_max_days),
    max_food_items: toLimit(record.max_food_items, fallback.max_food_items),
    max_products: toLimit(record.max_products, fallback.max_products),
    max_tables: toLimit(record.max_tables, fallback.max_tables),
  };
}

export async function getPlanPermissions(
  db: SupabaseClient,
  requestedPlan: unknown,
): Promise<{ plan: PlanKey; limits: PlanPermissions }> {
  const plan = normalizePlan(requestedPlan);
  const { data, error } = await db
    .from('system_settings')
    .select('dashboard_permissions')
    .eq('id', 'global')
    .maybeSingle();

  if (error) {
    console.warn('[PlanPermissions] Falling back to defaults:', error.message);
  }

  const dashboardPermissions = data?.dashboard_permissions as Record<string, unknown> | null;
  return {
    plan,
    limits: mergePlanPermissions(plan, dashboardPermissions?.[plan]),
  };
}

export async function getBrandPlanPermissions(
  db: SupabaseClient,
  brandId: string,
): Promise<{ plan: PlanKey; limits: PlanPermissions }> {
  const { data: brand, error } = await db
    .from('brands')
    .select('plan, expiry_basic, expiry_pro, expiry_ultimate')
    .eq('id', brandId)
    .maybeSingle();

  if (error) throw error;
  if (!brand) throw new Error('ไม่พบข้อมูลร้านค้า');

  return getPlanPermissions(db, calculateEffectivePlan(brand));
}

export function exceedsLimit(requested: number, limit: number) {
  return limit > 0 && requested > limit;
}

