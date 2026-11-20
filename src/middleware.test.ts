import { describe, expect, it, vi } from 'vitest'

vi.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: vi.fn(() => vi.fn()),
}))

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
    '/api/webhooks/clerk',
    '/static/logo.svg',
    '/images/avatar.png',
  ])('continues to exclude non-application route %s', (pathname) => {
    expect(routeMatcher.test(pathname)).toBe(false)
  })
})
