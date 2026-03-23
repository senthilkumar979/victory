'use client'

import { usePostHog } from 'posthog-js/react'
import { useEffect, useRef } from 'react'

interface PosthogCaptureOnceProps {
  event: string
  properties?: Record<string, unknown>
}

export const PosthogCaptureOnce = ({
  event,
  properties,
}: PosthogCaptureOnceProps) => {
  const posthog = usePostHog()
  const sent = useRef(false)

  useEffect(() => {
    if (sent.current) return
    sent.current = true
    posthog.capture(event, properties)
  }, [event, posthog, properties])

  return null
}
