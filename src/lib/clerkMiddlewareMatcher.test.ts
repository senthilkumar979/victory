import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  CLERK_MIDDLEWARE_MATCHER,
  isClerkMiddlewarePath,
} from '@/lib/clerkMiddlewareMatcher'

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

  it('is the matcher literal in middleware.ts', () => {
    const source = readFileSync(
      path.join(process.cwd(), 'src/middleware.ts'),
      'utf8',
    )
    expect(source).toContain(CLERK_MIDDLEWARE_MATCHER)
  })
})
