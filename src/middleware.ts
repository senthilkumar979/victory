import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Clerk runs only where a server session is required. Public pages and public
 * APIs are omitted so anonymous traffic does not spend Fluid Active CPU here.
 * The navbar still reads the signed-in user through Clerk's client SDK.
 *
 * The matcher string is `CLERK_MIDDLEWARE_MATCHER` in
 * `src/lib/clerkMiddlewareMatcher.ts`. Next.js requires that literal below.
 */
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?:sign-in|sign-up|session-tasks|post-login|secured|dashboard|profile|nano-banana)(?:/.*)?|api/(?:assignments|session-videos|meetings|github|cohorts|admin|invitations|awards|linkedin|nano-banana|logsnag)(?:/.*)?|api/students/[^/]+/guardian-details)",
  ],
};
