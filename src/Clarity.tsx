'use client'

import { useEffect } from 'react'

export const ClarityComponent = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const projectId =
      process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || 'yourProjectId'

    if (!projectId || projectId === 'yourProjectId') return

    const run = () => {
      void import('@microsoft/clarity').then(({ default: Clarity }) => {
        Clarity.init(projectId)
      })
    }

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(run, { timeout: 4000 })
      return () => window.cancelIdleCallback(id)
    }

    const timeoutId = globalThis.setTimeout(run, 1)
    return () => globalThis.clearTimeout(timeoutId)
  }, [])

  return null
}
