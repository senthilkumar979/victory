import type { Metadata } from 'next'

import { SITE_URL } from '@/lib/siteUrl'

export const metadata: Metadata = {
  title: 'Blogs',
  description:
    'Articles and tutorials from MentorBridge creators — software, careers, and learning from our student community.',
  alternates: { canonical: `${SITE_URL}/blogs` },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: 'Blogs | MentorBridge',
    description:
      'Articles and tutorials from MentorBridge creators — software, careers, and learning from our student community.',
    url: `${SITE_URL}/blogs`,
    type: 'website',
    siteName: 'MentorBridge',
  },
}

export default function BlogsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
