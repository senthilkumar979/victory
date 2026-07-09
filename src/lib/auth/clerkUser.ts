import 'server-only'

import { currentUser } from '@clerk/nextjs/server'

export type ClerkUser = NonNullable<Awaited<ReturnType<typeof currentUser>>>

export async function getCurrentUser(): Promise<ClerkUser | null> {
  return currentUser()
}

export function getPrimaryEmail(user: ClerkUser): string | null {
  const primary = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId,
  )
  return primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null
}

export function isAdminUser(user: ClerkUser): boolean {
  const meta = user.publicMetadata as Record<string, unknown>
  return meta.role === 'admin' || meta.isAdmin === true
}
