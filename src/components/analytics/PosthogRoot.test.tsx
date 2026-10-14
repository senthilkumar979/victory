import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('posthog-js/react', () => ({
  PostHogProvider: ({
    apiKey,
    options,
    children,
  }: {
    apiKey: string
    options: Record<string, unknown>
    children: ReactNode
  }) => (
    <div
      data-testid="posthog-provider"
      data-key={apiKey}
      data-options={JSON.stringify(options)}
    >
      {children}
    </div>
  ),
}))

vi.mock('./PosthogIdentify', () => ({
  PosthogIdentify: () => <div>identify</div>,
}))

vi.mock('./PosthogPageView', () => ({
  PosthogPageView: () => <div>pageview</div>,
}))

const ENV_KEYS = [
  'NEXT_PUBLIC_POSTHOG_KEY',
  'NEXT_PUBLIC_POSTHOG_HOST',
  'NEXT_PUBLIC_POSTHOG_DISABLE_SESSION_RECORDING',
  'NEXT_PUBLIC_POSTHOG_ENABLE_SURVEYS',
  'NEXT_PUBLIC_POSTHOG_DEAD_CLICKS',
] as const

const originalEnv = Object.fromEntries(
  ENV_KEYS.map((key) => [key, process.env[key]]),
)

function restoreEnv() {
  for (const key of ENV_KEYS) {
    const value = originalEnv[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
}

async function renderRoot() {
  vi.resetModules()
  const { PosthogRoot } = await import('./PosthogRoot')
  render(
    <PosthogRoot>
      <p>child</p>
    </PosthogRoot>,
  )
}

afterEach(() => {
  cleanup()
  restoreEnv()
  vi.resetModules()
})

describe('PosthogRoot', () => {
  it('renders children without PostHog when the key is missing or blank', async () => {
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY
    await renderRoot()
    expect(screen.getByText('child')).toBeInTheDocument()
    expect(screen.queryByTestId('posthog-provider')).not.toBeInTheDocument()

    cleanup()
    process.env.NEXT_PUBLIC_POSTHOG_KEY = ''
    await renderRoot()
    expect(screen.queryByTestId('posthog-provider')).not.toBeInTheDocument()
  })

  it('disables automatic pageviews and gates recording, surveys, and dead clicks', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'ph-key'
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://eu.posthog.com'
    process.env.NEXT_PUBLIC_POSTHOG_DISABLE_SESSION_RECORDING = 'true'
    process.env.NEXT_PUBLIC_POSTHOG_ENABLE_SURVEYS = 'true'
    process.env.NEXT_PUBLIC_POSTHOG_DEAD_CLICKS = 'false'

    await renderRoot()

    const provider = screen.getByTestId('posthog-provider')
    const options = JSON.parse(provider.getAttribute('data-options') ?? '{}') as {
      api_host: string
      capture_pageview: boolean
      capture_pageleave: boolean
      disable_session_recording: boolean
      disable_surveys: boolean
      capture_dead_clicks: boolean
    }

    expect(provider).toHaveAttribute('data-key', 'ph-key')
    expect(options).toMatchObject({
      api_host: 'https://eu.posthog.com',
      capture_pageview: false,
      capture_pageleave: true,
      disable_session_recording: true,
      disable_surveys: false,
      capture_dead_clicks: false,
    })
    expect(screen.getByText('identify')).toBeInTheDocument()
    expect(screen.getByText('pageview')).toBeInTheDocument()
    expect(screen.getByText('child')).toBeInTheDocument()
  })
})
