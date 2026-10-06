import { describe, expect, it } from 'vitest'

import {
  interviewPrepCardBar,
  interviewPrepHeroGlow,
} from './interviewPrepTheme'

const KNOWN_SLUGS = [
  'core-java',
  'javascript',
  'react',
  'spring-boot',
  'typescript',
] as const

const HERO_FALLBACK = 'from-primary/25 via-primary/5'
const CARD_FALLBACK = 'from-primary via-primary/60 to-primary'

describe('interviewPrepTheme', () => {
  it('uses a distinct accent for each published track slug', () => {
    for (const slug of KNOWN_SLUGS) {
      expect(interviewPrepHeroGlow(slug)).not.toBe(HERO_FALLBACK)
      expect(interviewPrepCardBar(slug)).not.toBe(CARD_FALLBACK)
    }

    expect(interviewPrepHeroGlow('react')).toContain('cyan')
    expect(interviewPrepCardBar('core-java')).toContain('orange')
  })

  it('falls back when the slug is unknown or differently cased', () => {
    expect(interviewPrepHeroGlow('java')).toBe(HERO_FALLBACK)
    expect(interviewPrepHeroGlow('')).toBe(HERO_FALLBACK)
    expect(interviewPrepCardBar('JavaScript')).toBe(CARD_FALLBACK)
    expect(interviewPrepCardBar('')).toBe(CARD_FALLBACK)
  })
})
