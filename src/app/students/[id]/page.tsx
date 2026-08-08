import type { Metadata } from 'next'

import { PersonJsonLd } from '@/components/seo/PersonJsonLd'
import { buildStudentDescription } from '@/lib/seo/buildStudentDescription'
import { getStudentForSeo } from '@/lib/seo/getStudentForSeo'
import { SITE_URL } from '@/lib/siteUrl'

import { StudentDetailPageClient } from './StudentDetailPageClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  const row = await getStudentForSeo(id)

  if (!row) {
    return {
      title: 'Student not found',
      robots: { index: false, follow: true },
    }
  }

  const title = `${row.name} | Students`
  const description = buildStudentDescription(row)
  const canonical = `${SITE_URL}/students/${id}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'profile',
      siteName: 'MentorBridge',
      locale: 'en_IN',
      ...(row.picture
        ? {
            images: [
              {
                url: row.picture,
                width: 512,
                height: 512,
                alt: row.name,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: row.picture ? 'summary_large_image' : 'summary',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  }
}

export default async function StudentDetailPage({ params }: PageProps) {
  const { id } = await params
  const row = await getStudentForSeo(id)

  return (
    <>
      {row ? <PersonJsonLd student={row} /> : null}
      <StudentDetailPageClient id={id} />
    </>
  )
}
