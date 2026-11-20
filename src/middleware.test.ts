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

  it.each([
    '/sign-in',
    '/sign-in/',
    '/sign-in/factor-one',
    '/sign-up',
    '/post-login',
    '/session-tasks/reset-password',
    '/secured/dashboard',
    '/dashboard',
    '/profile/student-id/edit',
    '/api/assignments/id/my-submission',
    '/api/students/student-id/guardian-details',
    '/api/github/repo',
    '/api/meetings/id/cover-image/upload',
    '/api/linkedin/oauth/start',
    '/api/nano-banana/generate',
    '/api/invitations/create',
    '/api/admin/visitor-chat-queries',
    '/api/cohorts',
    '/api/logsnag/track',
    '/api/session-videos/id/view',
    '/api/awards/id/cover-image/generate',
  ])('keeps Clerk on session route %s', (pathname) => {
    expect(routeMatcher.test(pathname)).toBe(true)
  })

  it.each([
    '/api/webhook',
    '/next/page',
  ])('does not let an exclusion prefix swallow %s', (pathname) => {
    expect(routeMatcher.test(pathname)).toBe(true)
  })

  it.each([
    '/api/webhooks',
    '/api/webhooks/resend',
    '/favicon.ico',
    '/robots.txt',
    '/_next/page',
  ])('skips Clerk for %s', (pathname) => {
    expect(routeMatcher.test(pathname)).toBe(false)
  })
})
