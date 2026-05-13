import { SITE_URL } from '@/lib/siteUrl'

const WEB_SITE_JSON = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'MentorBridge',
  url: SITE_URL,
  description:
    'Not-for-profit community helping rural students prepare for the IT industry through mentorship, training, and real-world projects.',
  publisher: {
    '@type': 'Organization',
    name: 'MentorBridge',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: 'https://91qunajyvl11yxyb.public.blob.vercel-storage.com/favicon.ico',
    },
  },
  inLanguage: 'en-IN',
} as const

export const WebSiteJsonLd = () => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(WEB_SITE_JSON) }}
  />
)
