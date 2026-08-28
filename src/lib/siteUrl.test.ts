import { afterEach, describe, expect, it, vi } from 'vitest'

const ORIGINAL_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

afterEach(() => {
  if (ORIGINAL_SITE_URL === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
  else process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL_SITE_URL
  vi.resetModules()
})

describe('SITE_URL', () => {
  it('defaults to the www origin without a trailing slash', async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    vi.resetModules()

    const { SITE_URL } = await import('./siteUrl')
    expect(SITE_URL).toBe('https://www.mentorbridge.in')
  })

  it('strips a trailing slash from the public site origin', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.mentorbridge.in/'
    vi.resetModules()

    const { SITE_URL } = await import('./siteUrl')
    expect(SITE_URL).toBe('https://www.mentorbridge.in')
  })

  it('uses a custom origin when NEXT_PUBLIC_SITE_URL is set', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://staging.mentorbridge.in'
    vi.resetModules()

    const { SITE_URL } = await import('./siteUrl')
    expect(SITE_URL).toBe('https://staging.mentorbridge.in')
  })
})
