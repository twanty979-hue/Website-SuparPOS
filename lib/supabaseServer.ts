import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const clients = new Map<string, SupabaseClient>();

/** Creates a server-only Supabase client on first use, never while a module loads. */
export function getLazySupabaseClient(
  url: string | undefined,
  key: string | undefined,
  role: 'admin' | 'anon',
) {
  if (!url || !key) {
    throw new Error(
      `Supabase ${role} credentials are not configured. Set the required Supabase environment variables.`,
    );
  }

  const cacheKey = `${role}:${url}:${key}`;
  const existing = clients.get(cacheKey);
  if (existing) return existing;

  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  clients.set(cacheKey, client);
  return client;
}

export function getSupabaseAdmin() {
  return getLazySupabaseClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    'admin',
  );
}

export function getSupabaseAnon() {
  return getLazySupabaseClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'anon',
  );
}
