'use client'

import { LogSnag } from 'logsnag'
import { useEffect } from 'react'
import { ContactUs } from './modules/Homepage/ContactUs/ContactUs'
import { Framework } from './modules/Homepage/Framework/Framework'
import { Hero } from './modules/Homepage/Hero/Hero'
import LearningDimensions from './modules/Homepage/LearningDimensions/LearningDimensions'
import MissionVision from './modules/Homepage/MissionVision/MissionVision'
import { JobPlacements } from './modules/Homepage/Placements/JobPlacements'
import Mentors from './modules/Mentors/Mentors'

export default function Home() {
  const logsnag = new LogSnag({
    token: process.env.LOGSTASH_API_TOKEN || '',
    project: 'mentorbridge-website',
  })

  const trackEvent = async () => {
    await logsnag.track({
      channel: 'profile',
      event: 'Successful Payment',
      user_id: 'user-123',
      description: '2x 1TB SSD - Overnight Shipping',
      icon: '💰',
      tags: {
        shipping: 'overnight',
        quantity: 2,
      },
    })
  }

  useEffect(() => {
    trackEvent()
  }, [])
  return (
    <main className="min-h-screen">
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
