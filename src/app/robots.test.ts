import { afterEach, describe, expect, it, vi } from 'vitest'

const PROTECTED_PATHS = [
  '/api/',
  '/secured/',
  '/dashboard',
  '/post-login',
  '/profile/',
  '/session-tasks/',
  '/sign-in/',
  '/sign-up/',
  '/components-demo',
] as const

describe('robots', () => {
  afterEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
    vi.doUnmock('@/lib/siteUrl')
  })

  it('disallows authenticated and API surfaces and points sitemap at SITE_URL', async () => {
    vi.doMock('@/lib/siteUrl', () => ({
      SITE_URL: 'https://www.mentorbridge.in',
    }))

    const { default: robots } = await import('./robots')
    const result = robots()
    const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules

    expect(rules?.userAgent).toBe('*')
    expect(rules?.allow).toBe('/')
    expect(rules?.disallow).toEqual([...PROTECTED_PATHS])
    expect(result.sitemap).toBe('https://www.mentorbridge.in/sitemap.xml')
  })

  it('does not introduce a double slash when SITE_URL has no trailing slash', async () => {
    vi.doMock('@/lib/siteUrl', () => ({
      SITE_URL: 'https://example.test',
    }))

    const { default: robots } = await import('./robots')
    expect(robots().sitemap).toBe('https://example.test/sitemap.xml')
  })
})
