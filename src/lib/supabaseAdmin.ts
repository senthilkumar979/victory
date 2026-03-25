import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role client for server-only routes that must bypass RLS (e.g. cron/sync).
 *
 * Prefer `SUPABASE_SERVICE_ROLE_KEY` (no NEXT_PUBLIC_ prefix) so the key is never
 * bundled for the browser. `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` is only read as
 * a fallback — if you use it, rename to the non-public name and rotate the key
 * in Supabase, since NEXT_PUBLIC_ values are exposed to clients.
 */
function createSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export const supabaseAdmin = createSupabaseAdmin()
