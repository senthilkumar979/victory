'use client'

import { useEffect } from 'react'
import Clarity from '@microsoft/clarity'

export const ClarityComponent = () => {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    const projectId =
      process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || 'yourProjectId'

    if (projectId && projectId !== 'yourProjectId') {
      Clarity.init(projectId)
    }
  }, [])

  return null
}
