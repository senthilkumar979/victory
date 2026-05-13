import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Use Clerk **production** API keys (`pk_live_…`) on Vercel production.
 * Development keys can confuse crawlers and add dev-only auth edge behavior.
 */
export default clerkMiddleware();

export const config = {
  matcher: [
    /*
     * Match all routes under `/post-login`, `/profile`, `/admin`
     * and any Clerk-auth routes.
     */
    "/((?!_next|api/webhooks|static|.*\\..*).*)",
  ],
};

