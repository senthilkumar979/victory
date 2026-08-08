'use client'

import * as Sentry from '@sentry/nextjs'
import { unstable_isUnrecognizedActionError } from 'next/navigation'
import { useEffect } from 'react'

interface AppErrorHandlers {
  reload: () => void
  report: (error: Error) => void
}

export function handleAppError(
  error: Error,
  handlers: AppErrorHandlers,
): void {
  if (unstable_isUnrecognizedActionError(error)) {
    handlers.reload()
    return
  }

  handlers.report(error)
}

export const useAppErrorHandler = (error: Error): void => {
  useEffect(() => {
    handleAppError(error, {
      reload: () => window.location.reload(),
      report: Sentry.captureException,
    })
  }, [error])
}
