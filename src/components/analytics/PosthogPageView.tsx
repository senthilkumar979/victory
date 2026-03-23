'use client'

import { usePostHog } from 'posthog-js/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

export const PosthogPageView = () => {
  const posthog = usePostHog()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastUrl = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname) return

    const search = searchParams?.toString()
    const url = `${window.location.origin}${pathname}${search ? `?${search}` : ''}`

    if (lastUrl.current === url) return
    lastUrl.current = url

    posthog.capture('$pageview', {
      $current_url: url,
    })
  }, [pathname, posthog, searchParams])

  return null
}
