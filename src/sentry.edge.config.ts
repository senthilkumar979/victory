import * as Sentry from '@sentry/nextjs'

import {
  isSentryEnabled,
  SENTRY_DSN,
  sentryEnvironment,
} from '@/lib/sentry/config'

if (isSentryEnabled) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: sentryEnvironment,
    sendDefaultPii: false,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.15 : 1,
  })
}
