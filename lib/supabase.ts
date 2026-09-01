import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | undefined

function getBrowserSupabaseClient() {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error(
      'Supabase browser configuration is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in the build environment.',
    )
  }

  client = createBrowserClient(url, anonKey)
  return client
}

// Defer client creation until browser code actually uses Supabase. This keeps
// static prerendering independent from browser-only environment variables.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    const value = Reflect.get(getBrowserSupabaseClient(), property)
    return typeof value === 'function' ? value.bind(getBrowserSupabaseClient()) : value
  },
})
