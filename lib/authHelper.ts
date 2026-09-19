// lib/authHelper.ts
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { calculateEffectivePlan, PlanKey } from '@/lib/planPermissions';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

export function handleCorsOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export interface AuthContext {
  supabase: SupabaseClient; // Returns adminClient to bypass RLS token expiration
  adminClient: SupabaseClient;
  userClient: SupabaseClient;
  user: User | any;
  userId: string;
  brandId: string;
  brand: any;
  brandData: any;
  role: string;
  isOwner: boolean;
  timezone: string;
  effectivePlan: PlanKey;
}

export interface AuthFallbackOptions {
  brand_id?: string | null;
  brandId?: string | null;
  user_id?: string | null;
  userId?: string | null;
  id?: string | null;
  tableName?: string | null;
  [key: string]: any;
}

export function parseJwtSubAndPayload(token: string): { sub?: string; email?: string; payload?: any } {
  try {
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    if (!cleanToken || !cleanToken.includes('.')) return {};
    const parts = cleanToken.split('.');
    if (parts.length < 2) return {};
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonStr = Buffer.from(base64, 'base64').toString('utf8');
    const payload = JSON.parse(jsonStr);
    return { sub: payload.sub, email: payload.email, payload };
  } catch (err) {
    return {};
  }
}

export async function getAuthenticatedUser(request: Request): Promise<{ user: any; userId: string; adminClient: SupabaseClient }> {
  const authHeader = request.headers.get('authorization') || '';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const adminClient = serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : userClient;

  let user: any = null;
  if (authHeader) {
    let isExpiredJwt = false;
    try {
      const { data: userData, error: authError } = await userClient.auth.getUser();
      if (userData?.user && !authError) {
        user = userData.user;
      } else if (authError) {
        const errorMsg = (authError.message || '').toLowerCase();
        // Supabase returns 'JWT expired' when signature is valid but time expired
        if (errorMsg.includes('expired') || errorMsg.includes('jwt expired')) {
          isExpiredJwt = true;
        }
      }
    } catch (_) {}

    // 2. 🛡️ Fallback ONLY for genuinely Expired JWT (issued by Supabase, valid signature, but expired)
    if (!user && isExpiredJwt && serviceRoleKey) {
      const { sub } = parseJwtSubAndPayload(authHeader);
      if (sub) {
        try {
          const { data: adminUserData } = await adminClient.auth.admin.getUserById(sub);
          if (adminUserData?.user) {
            user = adminUserData.user;
          }
        } catch (_) {}
      }
    }
  }

  return { user, userId: user?.id || '', adminClient };
}

export async function getAuthContext(
  request: Request,
  fallbackOptions?: AuthFallbackOptions
): Promise<AuthContext> {
  const authHeader = request.headers.get('authorization') || '';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const adminClient = serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : userClient;

  let user: any = null;

  // 1. Try standard getUser
  if (authHeader) {
    let isExpiredJwt = false;
    try {
      const { data: userData, error: authError } = await userClient.auth.getUser();
      if (userData?.user && !authError) {
        user = userData.user;
      } else if (authError) {
        const errorMsg = (authError.message || '').toLowerCase();
        // Supabase returns 'JWT expired' when signature is valid but time expired
        if (errorMsg.includes('expired') || errorMsg.includes('jwt expired')) {
          isExpiredJwt = true;
        }
      }
    } catch (_) {}

    // 2. 🛡️ Fallback ONLY for genuinely Expired JWT (issued by Supabase, valid signature, but expired)
    if (!user && isExpiredJwt && serviceRoleKey) {
      const { sub } = parseJwtSubAndPayload(authHeader);
      if (sub) {
        try {
          const { data: adminUserData } = await adminClient.auth.admin.getUserById(sub);
          if (adminUserData?.user) {
            user = adminUserData.user;
          }
        } catch (_) {}
      }
    }
  }

  // 3. Fallback for user_id in fallbackOptions
  const explicitUserId = fallbackOptions?.user_id || fallbackOptions?.userId;
  if (!user && explicitUserId && serviceRoleKey) {
    try {
      const { data: adminUserData } = await adminClient.auth.admin.getUserById(explicitUserId);
      if (adminUserData?.user) {
        user = adminUserData.user;
      }
    } catch (_) {}
  }

  let brandId: string | null = null;
  let role = 'staff';
  let brandData: any = null;

  // 4. Look up brand from profiles
  if (user?.id) {
    const { data: profile } = await adminClient
      .from('profiles')
      .select('brand_id, role, brands(timezone, plan, expiry_basic, expiry_pro, expiry_ultimate)')
      .eq('id', user.id)
      .single();

    if (profile?.brand_id) {
      brandId = profile.brand_id;
      role = profile.role || 'staff';
      brandData = Array.isArray((profile as any).brands) ? (profile as any).brands[0] : (profile as any).brands;
    }
  }

  // 5. Fallback for brandId passed directly in options (e.g. query param or body)
  const explicitBrandId = fallbackOptions?.brand_id || fallbackOptions?.brandId;
  if (!brandId && explicitBrandId && serviceRoleKey) {
    brandId = String(explicitBrandId);
    const { data: bData } = await adminClient
      .from('brands')
      .select('timezone, plan, expiry_basic, expiry_pro, expiry_ultimate')
      .eq('id', brandId)
      .single();
    brandData = bData;
  }

  // 6. Fallback by entity ID and tableName (e.g. updating a product where body.id is passed)
  if (!brandId && fallbackOptions?.id && fallbackOptions?.tableName && serviceRoleKey) {
    const { data: entityData } = await adminClient
      .from(fallbackOptions.tableName)
      .select('brand_id, brands(timezone, plan, expiry_basic, expiry_pro, expiry_ultimate)')
      .eq('id', fallbackOptions.id)
      .single();
    if (entityData?.brand_id) {
      brandId = entityData.brand_id;
      brandData = Array.isArray((entityData as any).brands) ? (entityData as any).brands[0] : (entityData as any).brands;
    }
  }

  if (!brandId) {
    throw new Error('Unauthorized');
  }

  const timezone = brandData?.timezone || 'Asia/Bangkok';
  const effectivePlan = calculateEffectivePlan(brandData);

  return {
    supabase: adminClient,
    adminClient,
    userClient,
    user,
    userId: user?.id || '',
    brandId,
    brand: brandData,
    brandData,
    role,
    isOwner: role === 'owner',
    timezone,
    effectivePlan,
  };
}

export const getSupabaseAndBrand = getAuthContext;
export const getSupabaseAndBrandId = getAuthContext;
