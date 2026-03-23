'use client'

import { useEffect, useRef } from 'react'

interface LogSnagPageViewProps {
  channel: string
  event?: string
  description?: string
  icon?: string
}

/**
 * Fires one LogSnag event per mount via POST /api/logsnag/track (server holds the API token).
 */
export const LogSnagPageView = ({
  channel,
  event = 'Page view',
  description,
  icon = '📄',
}: LogSnagPageViewProps) => {
  const sent = useRef(false)

  useEffect(() => {
    if (sent.current) return
    sent.current = true

    void fetch('/api/logsnag/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, event, description, icon }),
    })
  }, [channel, event, description, icon])

  return null
}
