import nextDynamic from 'next/dynamic'
import type { Metadata } from 'next'

import { LogSnagPageView } from '@/components/analytics/LogSnagPageView'
import { SITE_URL } from '@/lib/siteUrl'
import { PosthogCaptureOnce } from '@/components/analytics/PosthogCaptureOnce'

import { Hero } from './modules/Homepage/Hero/Hero'

const Framework = nextDynamic(() =>
  import('./modules/Homepage/Framework/Framework').then((m) => m.Framework),
)
const LearningDimensions = nextDynamic(
  () => import('./modules/Homepage/LearningDimensions/LearningDimensions'),
)
const Mentors = nextDynamic(() => import('./modules/Mentors/Mentors'))
const MissionVision = nextDynamic(
  () => import('./modules/Homepage/MissionVision/MissionVision'),
)
const JobPlacements = nextDynamic(() =>
  import('./modules/Homepage/Placements/JobPlacements').then((m) => m.JobPlacements),
)
const ContactUs = nextDynamic(() =>
  import('./modules/Homepage/ContactUs/ContactUs').then((m) => m.ContactUs),
)

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
}

/** Fully static HTML enables CDN caching and improves field TTFB vs dynamic rendering. */
export const dynamic = 'force-static'

export default function Home() {
  return (
    <main className="min-h-screen">
      <LogSnagPageView channel="home" description="Homepage" icon="🏠" />
      <PosthogCaptureOnce
        event="context_page_viewed"
        properties={{ channel: 'home', description: 'Homepage' }}
      />
      <Hero />
      <Framework />
      <LearningDimensions />
      <Mentors />
      <MissionVision />
      <JobPlacements />
      <ContactUs />
    </main>
  )
}
