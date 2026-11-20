import { describe, expect, it } from 'vitest'

import { isClerkMiddlewarePath } from '@/lib/clerkMiddlewareMatcher'

const PROTECTED = [
  '/sign-in',
  '/sign-in/factor-one',
  '/sign-up',
  '/session-tasks/reset-password',
  '/post-login',
  '/secured',
  '/secured/dashboard',
  '/secured/admin/student/abc',
  '/dashboard',
  '/profile/student-id/edit',
  '/nano-banana',
  '/api/assignments',
  '/api/assignments/id/submissions/sid/feedback',
  '/api/session-videos/id/view',
  '/api/meetings/create-google-meet',
  '/api/github/file',
  '/api/cohorts',
  '/api/admin/visitor-chat-queries',
  '/api/invitations/create',
  '/api/awards/id/cover-image/generate',
  '/api/linkedin/oauth/callback',
  '/api/nano-banana/generate',
  '/api/logsnag/track',
  '/api/students/student-id/guardian-details',
]

const PUBLIC = [
  '/',
  '/blogs',
  '/students',
  '/students/student-id',
  '/interview-prep',
  '/interview-prep/react',
  '/roadmaps',
  '/mentors',
  '/events',
  '/gallery',
  '/hall-of-fame',
  '/products',
  '/integrations',
  '/privacy-policy',
  '/terms-conditions',
  '/api/add-blog',
  '/api/sync-blogs/101',
  '/api/contact',
  '/api/visitor-chat',
  '/api/mobile/v1/me',
  '/api/public/cohorts',
  '/api/profile/upload',
]

describe('isClerkMiddlewarePath', () => {
  it('runs Clerk on session routes', () => {
    for (const pathname of PROTECTED) {
      expect(isClerkMiddlewarePath(pathname), pathname).toBe(true)
    }
  })

  it('skips public pages and public APIs', () => {
    for (const pathname of PUBLIC) {
      expect(isClerkMiddlewarePath(pathname), pathname).toBe(false)
    }
  })

  it.each([
    '/dashboard/',
    '/sign-in/',
    '/api/assignments/',
    '/api/students/student-id/guardian-details/',
    '/session-tasks',
    '/post-login/continue',
    '/api/admin',
  ])('includes boundary session path %s', (pathname) => {
    expect(isClerkMiddlewarePath(pathname)).toBe(true)
  })

  it.each([
    '/profiles',
    '/dashboarding',
    '/sign-in-help',
    '/nano-bananas',
    '/api/assignment',
    '/api/cohort',
    '/api/github2',
    '/api/administrator',
    '/api/students/student-id',
    '/api/students/student-id/guardian-details/extra',
    '/api/students//guardian-details',
    '/Dashboard',
    '/API/assignments',
  ])('rejects non-session path %s', (pathname) => {
    expect(isClerkMiddlewarePath(pathname)).toBe(false)
  })
})
