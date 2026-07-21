import 'server-only'

import { supabaseAdmin } from '@/lib/supabaseAdmin'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** True when value looks like a deliverable email (group or user). */
export function isEmailAddress(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

/**
 * Meetings may store either the group email or (legacy) google_groups.id UUID.
 * Calendar invites require a real email address.
 */
export async function resolveGoogleGroupEmail(
  value: string | null | undefined,
): Promise<string | null> {
  const trimmed = value?.trim()
  if (!trimmed) return null
  if (isEmailAddress(trimmed)) return trimmed

  const db = supabaseAdmin
  if (!db) {
    console.warn(
      '[resolveGoogleGroupEmail] supabaseAdmin unavailable; cannot resolve group id',
    )
    return null
  }

  const { data, error } = await db
    .from('google_groups')
    .select('email')
    .eq('id', trimmed)
    .maybeSingle()

  if (error) {
    console.error('[resolveGoogleGroupEmail]', error)
    return null
  }

  const email = (data?.email as string | undefined)?.trim()
  return email && isEmailAddress(email) ? email : null
}
