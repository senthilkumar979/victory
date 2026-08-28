import { describe, expect, it } from 'vitest'

import { awardFormSchema } from './awardFormSchema'

const validAward = {
  awardedTo: 'ada@example.com',
  awardedToName: 'Ada Lovelace',
  awardedOn: '2026-06-01T12:00:00.000Z',
  description: 'Outstanding contributor',
  awardCategoryId: 'cat-1',
}

describe('awardFormSchema', () => {
  it('accepts a complete award and trims recipient, description, and category', () => {
    const result = awardFormSchema.safeParse({
      ...validAward,
      awardedTo: '  ada@example.com  ',
      awardedToName: '  Ada Lovelace  ',
      description: '  Outstanding contributor  ',
      awardCategoryId: '  cat-1  ',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.awardedTo).toBe('ada@example.com')
      expect(result.data.awardedToName).toBe('Ada Lovelace')
      expect(result.data.description).toBe('Outstanding contributor')
      expect(result.data.awardCategoryId).toBe('cat-1')
    }
  })

  it('allows an empty optional category', () => {
    const result = awardFormSchema.safeParse({
      ...validAward,
      awardCategoryId: '',
    })

    expect(result.success).toBe(true)
    if (result.success) expect(result.data.awardCategoryId).toBe('')
  })

  it('rejects a missing recipient, date, or description after trim', () => {
    expect(
      awardFormSchema.safeParse({ ...validAward, awardedTo: '   ' }).success,
    ).toBe(false)
    expect(
      awardFormSchema.safeParse({ ...validAward, awardedOn: '' }).success,
    ).toBe(false)
    expect(
      awardFormSchema.safeParse({ ...validAward, description: '   ' }).success,
    ).toBe(false)
  })

  it('rejects an unparseable award date', () => {
    const result = awardFormSchema.safeParse({
      ...validAward,
      awardedOn: 'next Friday',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Invalid date')
    }
  })
})
