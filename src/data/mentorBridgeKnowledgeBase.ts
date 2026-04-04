import productDetails from '@/app/modules/Products/product-details.json'
import { MENTOR_BRIDGE } from '@/app/modules/Homepage/Hero/mentorBridgeCopy'
import { CARDS } from '@/app/modules/Homepage/Hero/data'
import { missionVisionContent } from '@/app/modules/Homepage/MissionVision/missionVisionContent'
import {
  horizontalPillars,
  verticalSteps,
} from '@/app/modules/Homepage/LearningDimensions/learningDimensionsContent'
import { mentors } from '@/app/modules/Mentors/mentorsContent'

const SITE_URL = 'https://www.mentorbridge.in'

function formatProducts(): string {
  return productDetails.products
    .map((p) => {
      const feats = p.features?.length ? p.features.join('; ') : ''
      const story = p.story?.lead ?? ''
      return [
        `**${p.name}** (${p.category})`,
        p.tagline,
        story,
        feats ? `Features: ${feats}` : '',
        p.impact ? `Impact note: ${p.impact}` : '',
        p.websiteUrl ? `Website: ${p.websiteUrl}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n\n')
}

function formatMentors(): string {
  return mentors
    .map(
      (m) =>
        `**${m.name}** — ${m.role}\n${m.description}\nTechnical areas: ${m.skills.join(', ')}\nLinkedIn: ${m.linkedin}`,
    )
    .join('\n\n')
}

function formatVerticalHorizontal(): string {
  const v = verticalSteps
    .map((s) => `- **${s.title}** — ${s.description}`)
    .join('\n')
  const h = horizontalPillars
    .map((p) => `- **${p.title}** — ${p.description}`)
    .join('\n')
  return `Vertical Mastery Tracks (deep technical stacks such as MERN or Java backend):\n${v}\n\nHorizontal Intelligence Pillars (professional skills):\n${h}`
}

function formatExampleOutcomes(): string {
  return CARDS.slice(0, 6)
    .map(
      (c) =>
        `${c.name}: studied at ${c.studentCollege} (${c.studentDept}), now ${c.professionalRole} at ${c.professionalCompany}`,
    )
    .join('\n')
}

/**
 * Single source of visitor-facing facts for the MentorBridge assistant.
 * Keep in sync with marketing pages when copy changes.
 */
export function getMentorBridgeKnowledgeBaseText(): string {
  const { mission, vision } = missionVisionContent

  return `
# MentorBridge — knowledge for visitors

## What MentorBridge is
- MentorBridge is a **not-for-profit community** that helps students—especially from rural areas—prepare for the **IT industry** through **hands-on training**, **mentorship**, and **real-world project experience**.
- Tagline on the site: **Bridging the Gap Between Learning and Industry**.
- The journey is summarized as: **"${MENTOR_BRIDGE.stepEyebrow}"** — students grow from **"${MENTOR_BRIDGE.labelStudent}"** to **"${MENTOR_BRIDGE.labelHired}"** with **${MENTOR_BRIDGE.bridgeDetail}**.
- Public website: ${SITE_URL}

## Mission
**${mission.title}** (${mission.zone})
${mission.body}

## Vision
**${vision.title}** (${vision.zone})
${vision.body}
${missionVisionContent.footerLine ? `\n_${missionVisionContent.footerLine}_` : ''}

## How we operate (learning model)
- MentorBridge uses a **T-shaped** model: **deep technical expertise** (vertical) plus **broad professional skills** (horizontal) so engineers can build systems and thrive in real workplaces.
- **Vertical mastery** includes focused learning in a technology stack, real projects, and understanding how systems work internally.
- **Horizontal intelligence** includes communication, career awareness, financial literacy, and problem-solving for organizational effectiveness.

${formatVerticalHorizontal()}

## Mentors (leadership)
${formatMentors()}

## Students and outcomes
- Students build profiles, showcase projects, and appear in **placements** and success stories on the site.
- The **Hall of Fame** recognizes students who show consistent growth, leadership, community contribution, and career transformation through mentorship.
- Example public transformation stories (hero section; roles and companies as shown on the site):
${formatExampleOutcomes()}
- (Additional alumni appear in the **Placements** section with links to full profiles.)

## Products and platforms (MentorBridge ecosystem)
${formatProducts()}

## What you can explore on the website
- **/** — Home: framework, mentors, mission/vision, placements, contact.
- **/students** — Student directory and profiles.
- **/events** — Events.
- **/roadmaps** — Learning roadmaps; some topics link to **interview preparation** practice.
- **/interview-prep** — Interview prep tracks and coding exercises (e.g. React, JavaScript, TypeScript, Core Java, Spring Boot).
- **/products** — Product overview (SecuroSphere, StubLab, StuPro, etc.).
- **/blogs** — Blog articles.
- **/hall-of-fame** — Hall of Fame inductees and criteria.
- **/gallery** — Gallery.
- **/privacy-policy** and **/terms-conditions** — Legal pages.

## Contact and social
- Email: **senthilkumar@mentorbridge.in**
- Phone: **+91 91760 08807** (India), **+32 456 76 37 10** (Belgium/Europe)
- General / transactional email used by the platform may include **mail@mentorbridge.in**
- LinkedIn: https://www.linkedin.com/company/mentor-bridge-india/
- X (Twitter): https://x.com/mentorbridgein
- YouTube: https://www.youtube.com/@mentor-bridge-india

## Boundaries for answers
- Do not invent admission rules, fees, batch dates, or guarantees not stated above.
- If asked for something not covered here, say you are not sure and suggest **senthilkumar@mentorbridge.in** or the contact form on the homepage.
`.trim()
}
