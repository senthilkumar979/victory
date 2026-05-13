import type { Metadata } from 'next'

import Mentors from '@/app/modules/Mentors/Mentors'
import { SITE_URL } from '@/lib/siteUrl'
import { PageMain } from '@/templates/PagaMain'

const description =
  'Meet the founders and mentors behind MentorBridge — guiding rural students into meaningful tech careers through hands-on training and community.'

const robots = {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true },
} as const

export const metadata: Metadata = {
  title: 'Mentors',
  description,
  alternates: { canonical: `${SITE_URL}/mentors` },
  robots,
  openGraph: {
    title: 'Mentors | MentorBridge',
    description,
    url: `${SITE_URL}/mentors`,
    type: 'website',
    siteName: 'MentorBridge',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mentors | MentorBridge',
    description,
  },
}

export default function MentorsPage() {
  return (
    <PageMain>
      <Mentors />
    </PageMain>
  )
}
