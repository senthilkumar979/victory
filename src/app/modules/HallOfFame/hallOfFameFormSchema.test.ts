import { describe, expect, it } from 'vitest'

import { hallOfFameFormSchema } from './hallOfFameFormSchema'

describe('hallOfFameFormSchema', () => {
  it('accepts a trimmed student email and valid induction date', () => {
    const result = hallOfFameFormSchema.safeParse({
      studentEmail: '  ada@example.com  ',
      dateOfInduction: '2026-06-01T00:00:00.000Z',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.studentEmail).toBe('ada@example.com')
    }
  })

  it('rejects a missing or invalid email', () => {
    expect(
      hallOfFameFormSchema.safeParse({
        studentEmail: '   ',
        dateOfInduction: '2026-06-01T00:00:00.000Z',
      }).success,
    ).toBe(false)
    expect(
      hallOfFameFormSchema.safeParse({
        studentEmail: 'not-an-email',
        dateOfInduction: '2026-06-01T00:00:00.000Z',
      }).success,
    ).toBe(false)
  })

  it('rejects an invalid induction date', () => {
    const result = hallOfFameFormSchema.safeParse({
      studentEmail: 'ada@example.com',
      dateOfInduction: 'tomorrow',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Invalid date')
    }
  })
})
