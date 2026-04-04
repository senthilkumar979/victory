import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/siteUrl'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/secured/',
        '/dashboard',
        '/post-login',
        '/profile/',
        '/session-tasks/',
        '/sign-in/',
        '/sign-up/',
        '/components-demo',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
