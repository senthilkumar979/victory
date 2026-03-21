import { ContactUs } from './modules/Homepage/ContactUs/ContactUs'
import { Framework } from './modules/Homepage/Framework/Framework'
import { Hero } from './modules/Homepage/Hero/Hero'
import LearningDimensions from './modules/Homepage/LearningDimensions/LearningDimensions'
import MissionVision from './modules/Homepage/MissionVision/MissionVision'
import Mentors from './modules/Mentors/Mentors'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Framework />
      <LearningDimensions />
      <Mentors />
      <MissionVision />
      <ContactUs />
    </main>
  )
}
