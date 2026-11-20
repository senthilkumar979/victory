import type { NextConfig } from 'next'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@sentry/nextjs', () => ({
  withSentryConfig: (config: NextConfig) => config,
}))

describe('nextConfig', () => {
  it('does not serve production browser source maps', async () => {
    const { default: nextConfig } = await import('../next.config')

    expect(nextConfig.productionBrowserSourceMaps).toBe(false)
  })
})
