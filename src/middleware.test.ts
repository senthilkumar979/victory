import { describe, expect, it, vi } from 'vitest'

vi.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: vi.fn(() => vi.fn()),
}))

import { CLERK_MIDDLEWARE_MATCHER } from '@/lib/clerkMiddlewareMatcher'

import { config } from './middleware'

const routeMatcher = new RegExp(`^${config.matcher[0]}$`)

describe('Clerk middleware matcher', () => {
  it.each([
    '/api/mobile/v1/me',
    '/api/mobile/v1/admin/students',
    '/api/mobile/v1/admin/students/student-id',
  ])('provides Clerk context to mobile route %s', (pathname) => {
    expect(routeMatcher.test(pathname)).toBe(true)
  })

  it.each([
    '/_next/static/chunks/app.js',
    '/api/webhooks',
    '/api/webhooks/resend',
    '/api/webhooks/clerk',
    '/static/logo.svg',
    '/images/avatar.png',
    '/favicon.ico',
    '/robots.txt',
    '/_next/page',
  ])('continues to exclude non-application route %s', (pathname) => {
    expect(routeMatcher.test(pathname)).toBe(false)
  })

  it('keeps mobile and nearby public paths on the installed matcher', () => {
    expect(config.matcher[0]).not.toBe(CLERK_MIDDLEWARE_MATCHER)
    expect(routeMatcher.test('/api/mobile/v1/me')).toBe(true)
    expect(routeMatcher.test('/api/webhook')).toBe(true)
    expect(routeMatcher.test('/next/page')).toBe(true)
  })
})
