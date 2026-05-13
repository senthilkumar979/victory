/** Canonical public site origin (no trailing slash). Must match the Search Console property URL (www vs apex). */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.mentorbridge.in'
).replace(/\/$/, '')
