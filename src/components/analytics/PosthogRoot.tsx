'use client'

import { PostHogProvider } from 'posthog-js/react'
import { Suspense, type ReactNode } from 'react'

import { PosthogIdentify } from './PosthogIdentify'
import { PosthogPageView } from './PosthogPageView'

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

interface PosthogRootProps {
  children: ReactNode
}

export const PosthogRoot = ({ children }: PosthogRootProps) => {
  if (!posthogKey) return children

  return (
    <PostHogProvider
      apiKey={posthogKey}
      options={{
        api_host: posthogHost,
        capture_pageview: false,
        capture_pageleave: true,
        persistence: 'localStorage+cookie',
        disable_session_recording:
          process.env.NEXT_PUBLIC_POSTHOG_DISABLE_SESSION_RECORDING === 'true',
      }}
    >
      <Suspense fallback={null}>
        <PosthogPageView />
      </Suspense>
      <PosthogIdentify />
      {children}
    </PostHogProvider>
  )
}
