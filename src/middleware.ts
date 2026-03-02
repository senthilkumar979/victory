import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/post-login(.*)",
  "/secured(.*)",
]);

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

