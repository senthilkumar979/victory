/** Shared Sentry wiring; DSN must be set for any reporting to run. */
export const SENTRY_DSN =
  process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN

export const isSentryEnabled = Boolean(SENTRY_DSN)

export const sentryEnvironment =
  process.env.NEXT_PUBLIC_VERCEL_ENV ??
  process.env.VERCEL_ENV ??
  process.env.NODE_ENV
