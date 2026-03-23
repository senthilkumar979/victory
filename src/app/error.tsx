'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

import { PrimaryButton } from '@/ui/atoms/button/Button'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4 py-16">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-slate-900">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          We have been notified. You can try again or return to the homepage.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <PrimaryButton type="button" size="md" onClick={reset}>
          Try again
        </PrimaryButton>
      </div>
    </div>
  )
}
