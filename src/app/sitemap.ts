import type { MetadataRoute } from 'next'

import { ROADMAP_SLUGS } from '@/data/roadmaps'
import { INTERVIEW_TRACK_SLUGS } from '@/data/interview-prep'
import { listStudentProfileIds } from '@/lib/seo/listStudentProfileIds'
import { SITE_URL } from '@/lib/siteUrl'

/** Refresh sitemap periodically so new student profiles appear in Search Console. */
export const revalidate = 86400

const STATIC_PATHS: {
  path: string
  priority: number
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
}[] =
  [
    { path: '/', priority: 1, changeFrequency: 'weekly' },
    { path: '/mentors', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/blogs', priority: 0.85, changeFrequency: 'weekly' },
    { path: '/students', priority: 0.85, changeFrequency: 'weekly' },
    { path: '/events', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/gallery', priority: 0.75, changeFrequency: 'monthly' },
    { path: '/hall-of-fame', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/integrations', priority: 0.65, changeFrequency: 'monthly' },
    { path: '/interview-prep', priority: 0.85, changeFrequency: 'weekly' },
    { path: '/products', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/roadmaps', priority: 0.85, changeFrequency: 'weekly' },
    { path: '/nano-banana', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/privacy-policy', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/terms-conditions', priority: 0.4, changeFrequency: 'yearly' },
  ]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date()
  const out: MetadataRoute.Sitemap = []

  for (const { path, priority, changeFrequency } of STATIC_PATHS) {
    out.push({
      url: path === '/' ? SITE_URL : `${SITE_URL}${path}`,
      lastModified,
      changeFrequency,
      priority,
    })
  }

  for (const slug of ROADMAP_SLUGS) {
    out.push({
      url: `${SITE_URL}/roadmaps/${slug}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.75,
    })
  }

  for (const slug of INTERVIEW_TRACK_SLUGS) {
    out.push({
      url: `${SITE_URL}/interview-prep/${slug}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.75,
    })
  }

  const studentIds = await listStudentProfileIds()
  for (const id of studentIds) {
    out.push({
      url: `${SITE_URL}/students/${id}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    })
  }

  return out
}
