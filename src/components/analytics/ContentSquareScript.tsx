'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

export const CONTENTSQUARE_SRC =
  'https://t.contentsquare.net/uxa/5027a5ad08b17.js'

/**
 * Contentsquare evaluates the DOM `Location` constructor at parse time.
 * Skip the tag in runtimes that do not expose that constructor.
 */
export function canLoadContentsquareTag(): boolean {
  return typeof window !== 'undefined' && typeof Location !== 'undefined'
}

export const ContentSquareScript = () => {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    setShouldLoad(canLoadContentsquareTag())
  }, [])

  if (!shouldLoad) return null

  return <Script src={CONTENTSQUARE_SRC} strategy="lazyOnload" />
}
