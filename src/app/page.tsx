import { LogSnagPageView } from '@/components/analytics/LogSnagPageView'
import { PosthogCaptureOnce } from '@/components/analytics/PosthogCaptureOnce'

import { ContactUs } from './modules/Homepage/ContactUs/ContactUs'
import { Framework } from './modules/Homepage/Framework/Framework'
import { Hero } from './modules/Homepage/Hero/Hero'
import LearningDimensions from './modules/Homepage/LearningDimensions/LearningDimensions'
import MissionVision from './modules/Homepage/MissionVision/MissionVision'
import { JobPlacements } from './modules/Homepage/Placements/JobPlacements'
import Mentors from './modules/Mentors/Mentors'

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
