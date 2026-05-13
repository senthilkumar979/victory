import type { Metadata } from 'next'

import { PersonJsonLd } from '@/components/seo/PersonJsonLd'
import { getStudentForSeo } from '@/lib/seo/getStudentForSeo'
import { SITE_URL } from '@/lib/siteUrl'

import { StudentDetailPageClient } from './StudentDetailPageClient'

interface PageProps {
  params: Promise<{ id: string }>
}

function buildDescription(row: NonNullable<Awaited<ReturnType<typeof getStudentForSeo>>>) {
  if (row.summary?.trim()) {
    const t = row.summary.trim()
    return t.length > 160 ? `${t.slice(0, 157)}…` : t
  }
  const rolePart =
    row.role && row.company
      ? `${row.role} at ${row.company}`
      : row.role || row.company || 'MentorBridge student'
  return `${row.name} — ${rolePart}. Part of the MentorBridge rural tech community.`
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
  const description = buildDescription(row)
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
