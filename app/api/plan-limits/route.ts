import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import {
  getBrandPlanPermissions,
  getPlanPermissions,
  normalizePlan,
} from '@/lib/planPermissions';

export const dynamic = 'force-dynamic';

const responseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'no-store, max-age=0',
};

const admin = () => createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...responseHeaders,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request: Request) {
  try {
    const db = admin();
    const url = new URL(request.url);
    const requestedPlan = normalizePlan(url.searchParams.get('plan'));
    const authorization = request.headers.get('authorization');
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : null;

    let context = await getPlanPermissions(db, requestedPlan);

    if (token) {
      const {
        data: { user },
      } = await db.auth.getUser(token);

      if (user) {
        const { data: profile } = await db
          .from('profiles')
          .select('brand_id')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.brand_id) {
          context = await getBrandPlanPermissions(db, profile.brand_id);
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        plan: context.plan,
        limits: {
          max_food_items: context.limits.max_food_items,
          max_products: context.limits.max_products,
          max_tables: context.limits.max_tables,
        },
      },
      { headers: responseHeaders },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'โหลดข้อจำกัดแพ็กเกจไม่สำเร็จ',
      },
      { status: 500, headers: responseHeaders },
    );
  }
}

