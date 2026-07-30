import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Use Clerk **production** API keys (`pk_live_…`) on Vercel production.
 * Development keys can confuse crawlers and add dev-only auth edge behavior.
 *
 * Clerk middleware does not protect or redirect routes unless explicitly asked.
 * Keep mobile routes matched so `currentUser()` receives Clerk's request context;
 * the route handlers still enforce Bearer authentication and authorization.
 */
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|api/webhooks|static|.*\\..*).*)",
  ],
};
