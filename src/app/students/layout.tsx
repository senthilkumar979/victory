import type { Metadata } from 'next'

import { SITE_URL } from '@/lib/siteUrl'

export const metadata: Metadata = {
  title: 'Students',
  description:
    'Browse MentorBridge students and alumni — skills, projects, and career journeys from our rural tech community.',
  alternates: { canonical: `${SITE_URL}/students` },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: 'Students | MentorBridge',
    description:
      'Browse MentorBridge students and alumni — skills, projects, and career journeys from our rural tech community.',
    url: `${SITE_URL}/students`,
    type: 'website',
    siteName: 'MentorBridge',
  },
}

export default function StudentsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
