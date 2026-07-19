import 'server-only'

import { verifyToken } from '@clerk/backend'
import { clerkClient, currentUser } from '@clerk/nextjs/server'
import { headers } from 'next/headers'

export type ClerkUser = NonNullable<Awaited<ReturnType<typeof currentUser>>>

/**
 * Cookie session first when Clerk middleware ran; Bearer JWT for mobile BFF.
 * `/api/mobile` is excluded from middleware, so `currentUser()` can throw — catch it
 * and prefer Authorization Bearer for those routes.
 */
export async function getCurrentUser(): Promise<ClerkUser | null> {
  const headerStore = await headers()
  const authHeader = headerStore.get('authorization')
  const bearer =
    authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : ''

  if (bearer) {
    const fromBearer = await userFromBearerToken(bearer)
    if (fromBearer) return fromBearer
  }

  try {
    const cookieUser = await currentUser()
    if (cookieUser) return cookieUser
  } catch (err) {
    console.error('[getCurrentUser] currentUser() failed (middleware may be skipped)', err)
  }

  return null
}

async function userFromBearerToken(token: string): Promise<ClerkUser | null> {
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
