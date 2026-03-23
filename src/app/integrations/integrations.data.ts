export interface IntegrationItem {
  name: string
  description: string
  href: string
}

export const INTEGRATIONS: readonly IntegrationItem[] = [
  {
    name: 'Clerk',
    description: 'Authentication, sessions, and user management.',
    href: 'https://dashboard.clerk.com',
  },
  {
    name: 'PostHog',
    description: 'Product analytics, page views, and event tracking.',
    href: 'https://eu.posthog.com',
  },
  {
    name: 'Sentry',
    description: 'Error monitoring, performance traces, and session replay on errors.',
    href: 'https://sentry.io',
  },
  {
    name: 'Vercel',
    description: 'Hosting plus Vercel Analytics and Speed Insights.',
    href: 'https://vercel.com/dashboard',
  },
  {
    name: 'Microsoft Clarity',
    description: 'Heatmaps and behavioral analytics.',
    href: 'https://clarity.microsoft.com',
  },
  {
    name: 'LogSnag',
    description: 'Channel notifications for page views and product events.',
    href: 'https://logsnag.com',
  },
  {
    name: 'Supabase',
    description: 'Postgres database, auth helpers, and serverless functions.',
    href: 'https://supabase.com/dashboard',
  },
]
