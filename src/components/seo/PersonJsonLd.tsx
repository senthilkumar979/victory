import { SITE_URL } from '@/lib/siteUrl'

import type { StudentSeoRow } from '@/lib/seo/getStudentForSeo'

interface PersonJsonLdProps {
  student: StudentSeoRow
}

export const PersonJsonLd = ({ student }: PersonJsonLdProps) => {
  const profileUrl = `${SITE_URL}/students/${student.id}`
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: student.name,
    url: profileUrl,
    ...(student.picture ? { image: student.picture } : {}),
    ...(student.role ? { jobTitle: student.role } : {}),
    ...(student.company
      ? {
          worksFor: {
            '@type': 'Organization',
            name: student.company,
          },
        }
      : {}),
    memberOf: {
      '@type': 'Organization',
      name: 'MentorBridge',
      url: SITE_URL,
    },
    ...(student.summary ? { description: student.summary } : {}),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': profileUrl,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  )
}
