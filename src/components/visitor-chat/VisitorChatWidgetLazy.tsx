'use client'

import dynamic from 'next/dynamic'

/** Deferred client-only bundle so the homepage ships less JS before first paint. */
export const VisitorChatWidgetLazy = dynamic(
  () =>
    import('./VisitorChatWidget').then((m) => m.VisitorChatWidget),
  { ssr: false },
)
