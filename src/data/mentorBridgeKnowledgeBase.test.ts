import { describe, expect, it } from 'vitest'

import productDetails from '@/app/modules/Products/product-details.json'
import { CARDS } from '@/app/modules/Homepage/Hero/data'
import {
  horizontalPillars,
  verticalSteps,
} from '@/app/modules/Homepage/LearningDimensions/learningDimensionsContent'
import { missionVisionContent } from '@/app/modules/Homepage/MissionVision/missionVisionContent'
import { mentors } from '@/app/modules/Mentors/mentorsContent'

import { getMentorBridgeKnowledgeBaseText } from './mentorBridgeKnowledgeBase'

const OUTCOME_WINDOW = 6

function section(text: string, heading: string, nextHeading: string): string {
  const start = text.indexOf(heading)
  const end = text.indexOf(nextHeading, start + heading.length)
  return text.slice(start, end)
}

describe('getMentorBridgeKnowledgeBaseText', () => {
  const text = getMentorBridgeKnowledgeBaseText()

  it('keeps mission, vision, and the do-not-invent boundary in the assistant prompt', () => {
    expect(text).toContain(missionVisionContent.mission.title)
    expect(text).toContain(missionVisionContent.mission.body)
    expect(text).toContain(missionVisionContent.vision.title)
    expect(text).toContain(`_${missionVisionContent.footerLine}_`)
    expect(text).toContain('https://www.mentorbridge.in')
    expect(text).toContain('Do not invent admission rules, fees, batch dates')
    expect(text).toContain('senthilkumar@mentorbridge.in')
  })

  it('includes every learning-model title, mentor, and product fact the chat can cite', () => {
    for (const step of verticalSteps) {
      expect(text).toContain(`**${step.title}**`)
      expect(text).toContain(step.description)
    }
    for (const pillar of horizontalPillars) {
      expect(text).toContain(`**${pillar.title}**`)
    }

    for (const mentor of mentors) {
      expect(text).toContain(`**${mentor.name}**`)
      expect(text).toContain(mentor.role)
      expect(text).toContain(mentor.linkedin)
      expect(text).toContain(mentor.skills.join(', '))
    }

    for (const product of productDetails.products) {
      expect(text).toContain(`**${product.name}**`)
      expect(text).toContain(product.tagline)
      expect(text).toContain(`Features: ${product.features.join('; ')}`)
      expect(text).toContain(`Website: ${product.websiteUrl}`)
    }
  })

  it('cites only the first six hero outcomes', () => {
    const outcomes = section(
      text,
      'Example public transformation stories',
      '## Products and platforms',
    )

    for (const card of CARDS.slice(0, OUTCOME_WINDOW)) {
      expect(outcomes).toContain(
        `${card.name}: studied at ${card.studentCollege} (${card.studentDept}), now ${card.professionalRole} at ${card.professionalCompany}`,
      )
    }

    for (const card of CARDS.slice(OUTCOME_WINDOW)) {
      expect(outcomes).not.toContain(`${card.name}:`)
    }
  })
})
