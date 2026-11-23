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

  it('accepts a trailing slash on a session route', () => {
    expect(isClerkMiddlewarePath('/dashboard/')).toBe(true)
    expect(isClerkMiddlewarePath('/sign-in/')).toBe(true)
    expect(isClerkMiddlewarePath('/api/assignments/')).toBe(true)
    expect(
      isClerkMiddlewarePath('/api/students/student-id/guardian-details/'),
    ).toBe(true)
  })

  it('rejects prefix lookalikes and guardian paths that are not the details route', () => {
    expect(isClerkMiddlewarePath('/profiles')).toBe(false)
    expect(isClerkMiddlewarePath('/dashboarding')).toBe(false)
    expect(isClerkMiddlewarePath('/sign-in-help')).toBe(false)
    expect(isClerkMiddlewarePath('/api/assignment')).toBe(false)
    expect(isClerkMiddlewarePath('/api/students/student-id')).toBe(false)
    expect(
      isClerkMiddlewarePath(
        '/api/students/student-id/guardian-details/extra',
      ),
    ).toBe(false)
    expect(isClerkMiddlewarePath('/api/students//guardian-details')).toBe(
      false,
    )
    expect(isClerkMiddlewarePath('/Dashboard')).toBe(false)
  })
})
