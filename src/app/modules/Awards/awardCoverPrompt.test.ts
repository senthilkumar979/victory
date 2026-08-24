import { describe, expect, it } from 'vitest'

import type { AwardFormState } from './Award.types'
import { buildDefaultAwardCoverPrompt } from './awardCoverPrompt'

function award(overrides: Partial<AwardFormState> = {}): AwardFormState {
  return {
    awardedTo: '',
    awardedOn: '2026-01-15T18:30:00.000Z',
    description: '',
    awardCategoryId: 'cat-1',
    ...overrides,
  }
}

describe('buildDefaultAwardCoverPrompt', () => {
  it('prefers the trimmed student name and formats the IST award date', () => {
    const prompt = buildDefaultAwardCoverPrompt(
      award({
        student: { name: '  Ada Lovelace  ', picture: '', batch: '1' },
        awardedTo: 'Ignored',
      }),
      'Excellence',
    )

    expect(prompt).toContain('Awarded to (show as text on the design): Ada Lovelace')
    expect(prompt).toContain('Award category: Excellence')
    expect(prompt).toContain('Awarded on: Jan 16, 2026')
    expect(prompt).not.toContain('Recognition / description')
  })

  it('falls back to awardedTo, then Student, and a generic category', () => {
    expect(buildDefaultAwardCoverPrompt(award({ awardedTo: 'Grace' }), '')).toContain(
      'Awarded to (show as text on the design): Grace',
    )
    expect(buildDefaultAwardCoverPrompt(award(), '')).toContain(
      'Awarded to (show as text on the design): Student',
    )
    expect(buildDefaultAwardCoverPrompt(award(), '')).toContain('Award category: Award')
  })

  it('strips HTML and truncates long descriptions to 500 characters', () => {
    const longPlain = 'A'.repeat(501)
    const prompt = buildDefaultAwardCoverPrompt(
      award({ description: `<p>${longPlain}</p>` }),
      'Leadership',
    )

    expect(prompt).toContain('Recognition / description')
    expect(prompt).toContain(`${'A'.repeat(500)}…`)
    expect(prompt).not.toContain('A'.repeat(501))
    expect(prompt).not.toContain('<p>')
  })
})
