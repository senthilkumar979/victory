/** Canonical public site origin (no trailing slash). */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.mentorbridge.in'
).replace(/\/$/, '')
