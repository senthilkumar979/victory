import { SITE_URL } from '@/lib/siteUrl'

const ORGANIZATION_JSON = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'MentorBridge',
  description:
    'Not-for-profit community helping students prepare for the IT industry through hands-on training, mentorship, and real-world project experience.',
  url: SITE_URL,
  logo:
    'https://91qunajyvl11yxyb.public.blob.vercel-storage.com/favicon.ico',
  sameAs: [
    'https://www.linkedin.com/company/mentor-bridge-india/',
    'https://x.com/mentorbridgein',
    'https://www.youtube.com/@mentor-bridge-india',
  ],
} as const

export const OrganizationJsonLd = () => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON) }}
  />
)
