import dynamic from 'next/dynamic'
import type { Metadata } from 'next'

import { LogSnagPageView } from '@/components/analytics/LogSnagPageView'
import { SITE_URL } from '@/lib/siteUrl'
import { PosthogCaptureOnce } from '@/components/analytics/PosthogCaptureOnce'

import { Hero } from './modules/Homepage/Hero/Hero'

const Framework = dynamic(() =>
  import('./modules/Homepage/Framework/Framework').then((m) => m.Framework),
)
const LearningDimensions = dynamic(
  () => import('./modules/Homepage/LearningDimensions/LearningDimensions'),
)
const Mentors = dynamic(() => import('./modules/Mentors/Mentors'))
const MissionVision = dynamic(
  () => import('./modules/Homepage/MissionVision/MissionVision'),
)
const JobPlacements = dynamic(() =>
  import('./modules/Homepage/Placements/JobPlacements').then((m) => m.JobPlacements),
)
const ContactUs = dynamic(() =>
  import('./modules/Homepage/ContactUs/ContactUs').then((m) => m.ContactUs),
)

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
}

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
