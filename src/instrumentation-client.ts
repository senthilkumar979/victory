import * as Sentry from '@sentry/nextjs'

import {
  cefSharpObjectNotFoundErrorPattern,
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
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1,
    ignoreErrors: [cefSharpObjectNotFoundErrorPattern],
    beforeSend(event) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[Sentry]',
          event.exception?.values?.[0]?.value ?? event.message,
        )
      }
      return event
    },
  })
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
