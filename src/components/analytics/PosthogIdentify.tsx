'use client'

import { useUser } from '@clerk/nextjs'
import { usePostHog } from 'posthog-js/react'
import { useEffect, useRef } from 'react'

export const PosthogIdentify = () => {
  const { user, isLoaded } = useUser()
  const posthog = usePostHog()
  const lastId = useRef<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return

    if (user) {
      if (lastId.current === user.id) return
      lastId.current = user.id

      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName ?? undefined,
        username: user.username ?? undefined,
      })
      return
    }

    if (lastId.current !== null) {
      lastId.current = null
      posthog.reset()
    }
  }, [isLoaded, posthog, user])

  return null
}
