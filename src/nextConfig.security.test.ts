import type { NextConfig } from 'next'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@sentry/nextjs', () => ({
  withSentryConfig: (config: NextConfig) => config,
}))

const remoteImageHosts = [
  '91qunajyvl11yxyb.public.blob.vercel-storage.com',
  '*.public.blob.vercel-storage.com',
  '*.supabase.co',
  'cdn.prod.website-files.com',
  'frigate.ai',
  'klyonix.com',
  '*.zohobackstage.com',
  'wfkq0nguanh0273r.public.blob.vercel-storage.com',
  'img.youtube.com',
  'i.ytimg.com',
  'www.teksage.app',
]

describe('nextConfig security', () => {
  it('sends clickjacking, sniffing, referrer, and device-permission headers', async () => {
    const { default: nextConfig } = await import('../next.config')

    await expect(nextConfig.headers?.()).resolves.toEqual([
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ])
  })

  it('permanently redirects retired product detail URLs to the catalog', async () => {
    const { default: nextConfig } = await import('../next.config')

    await expect(nextConfig.redirects?.()).resolves.toEqual([
      {
        source: '/product-detail/:slug',
        destination: '/products',
        permanent: true,
      },
    ])
  })

  it('allows next/image to load only the known remote hosts', async () => {
    const { default: nextConfig } = await import('../next.config')
    const hostnames = (nextConfig.images?.remotePatterns ?? []).map(
      (pattern) => pattern.hostname,
    )

    expect(hostnames).toEqual(remoteImageHosts)
  })
})
