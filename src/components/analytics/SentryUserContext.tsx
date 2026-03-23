'use client'

import { useUser } from '@clerk/nextjs'
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

import { isSentryEnabled } from '@/lib/sentry/config'

export const SentryUserContext = () => {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (!isSentryEnabled || !isLoaded) return

    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        username: user.username ?? undefined,
      })
      return
    }

    Sentry.setUser(null)
  }, [isLoaded, user])

  return null
}
