import type { Metadata } from 'next'

import { SITE_URL } from '@/lib/siteUrl'

const robots = {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true },
} as const

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'Terms and conditions for using the MentorBridge platform, programs, and community services.',
  alternates: { canonical: `${SITE_URL}/terms-conditions` },
  robots,
  openGraph: {
    title: 'Terms & Conditions | MentorBridge',
    description:
      'Terms and conditions for using the MentorBridge platform, programs, and community services.',
    url: `${SITE_URL}/terms-conditions`,
    type: 'website',
    siteName: 'MentorBridge',
  },
}

export default function TermsConditionsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
