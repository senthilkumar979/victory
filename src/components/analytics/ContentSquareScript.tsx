'use client'

import Script from 'next/script'

const CONTENTSQUARE_SRC =
  'https://t.contentsquare.net/uxa/5027a5ad08b17.js'

/** Loads Contentsquare after the main thread is idle to reduce TBT and main-thread work. */
export const ContentSquareScript = () => (
  <Script src={CONTENTSQUARE_SRC} strategy="lazyOnload" />
)
