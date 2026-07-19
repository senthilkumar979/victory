import 'server-only'

import { verifyToken } from '@clerk/backend'
import { clerkClient, currentUser } from '@clerk/nextjs/server'
import { headers } from 'next/headers'

export type ClerkUser = NonNullable<Awaited<ReturnType<typeof currentUser>>>

/**
 * Cookie session first; Bearer JWT fallback for mobile BFF clients.
 */
export async function getCurrentUser(): Promise<ClerkUser | null> {
  const cookieUser = await currentUser()
  if (cookieUser) return cookieUser

  const headerStore = await headers()
  const authHeader = headerStore.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice('Bearer '.length).trim()
  if (!token) return null

  const secretKey = process.env.CLERK_SECRET_KEY
  if (!secretKey) {
    console.error('[getCurrentUser] CLERK_SECRET_KEY missing')
    return null
  }

  try {
    const payload = await verifyToken(token, { secretKey })
    const userId = payload.sub
    if (!userId) return null

    const client = await clerkClient()
    return (await client.users.getUser(userId)) as ClerkUser
  } catch (err) {
    console.error('[getCurrentUser] Bearer token verification failed', err)
    return null
  }
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
