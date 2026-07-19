import 'server-only'

import { NextResponse } from 'next/server'

import {
  getCurrentUser,
  getPrimaryEmail,
  isAdminUser,
  type ClerkUser,
} from '@/lib/auth/clerkUser'

export interface MobileAuthSuccess {
  user: ClerkUser
  email: string
  userId: string
}

export interface MobileAuthFailure {
  error: NextResponse
}

export async function authenticateMobileRequest(): Promise<
  MobileAuthSuccess | MobileAuthFailure
> {
  const user = await getCurrentUser()
  if (!user) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 },
      ),
    }
  }

  const email = getPrimaryEmail(user)
  if (!email) {
    return {
      error: NextResponse.json(
        { error: 'No email on account', code: 'FORBIDDEN' },
        { status: 403 },
      ),
    }
  }

  return { user, email, userId: user.id }
}

export async function authenticateMobileAdmin(): Promise<
  MobileAuthSuccess | MobileAuthFailure
> {
  const result = await authenticateMobileRequest()
  if ('error' in result) return result

  if (!isAdminUser(result.user)) {
    return {
      error: NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN' },
        { status: 403 },
      ),
    }
  }

  return result
}
