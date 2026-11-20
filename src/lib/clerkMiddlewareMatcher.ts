/**
 * Paths that need Clerk's server session. Public pages and public APIs stay
 * off this list so crawlers do not spend Fluid Active CPU in middleware.
 * `src/middleware.ts` must paste this string into `config.matcher` — Next.js
 * only accepts a literal there.
 */
export const CLERK_MIDDLEWARE_MATCHER =
  '/((?:sign-in|sign-up|session-tasks|post-login|secured|dashboard|profile|nano-banana)(?:/.*)?|api/(?:assignments|session-videos|meetings|github|cohorts|admin|invitations|awards|linkedin|nano-banana|logsnag)(?:/.*)?|api/students/[^/]+/guardian-details)'

export function isClerkMiddlewarePath(pathname: string): boolean {
  const inner = CLERK_MIDDLEWARE_MATCHER.slice(1)
  return new RegExp(`^(?:/${inner})[/#?]?$`).test(pathname)
}
