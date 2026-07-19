import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Use Clerk **production** API keys (`pk_live_…`) on Vercel production.
 * Development keys can confuse crawlers and add dev-only auth edge behavior.
 *
 * `/api/mobile` is excluded so mobile Bearer JWT routes handle auth in-route
 * without cookie-based redirects. Other API routes still run through middleware
 * so cookie sessions and Bearer tokens can be resolved by Clerk.
 */
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|api/webhooks|api/mobile|static|.*\\..*).*)",
  ],
};
