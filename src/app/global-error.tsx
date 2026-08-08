'use client'

import NextError from 'next/error'

import { useAppErrorHandler } from '@/hooks/useAppErrorHandler'

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useAppErrorHandler(error)

  return (
    <html lang="en">
      <body className="bg-slate-50 antialiased">
        <NextError statusCode={0} />
      </body>
    </html>
  )
}
