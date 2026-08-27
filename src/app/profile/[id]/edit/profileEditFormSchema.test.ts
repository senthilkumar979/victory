import { describe, expect, it } from 'vitest'

import { profileEditFormSchema } from './profileEditFormSchema'

const cohortId = '11111111-1111-4111-8111-111111111111'

function parseProfile(overrides: Record<string, unknown> = {}) {
  return profileEditFormSchema.safeParse({
    name: 'Ada Lovelace',
    role: 'Student',
    email: 'ada@example.com',
    cohortId,
    ...overrides,
  })
}

describe('profileEditFormSchema', () => {
  it('coerces missing optional strings and trims required fields', () => {
    const result = parseProfile({
      name: '  Ada  ',
      role: '  Engineer  ',
      email: '  ada@example.com  ',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Ada')
      expect(result.data.role).toBe('Engineer')
      expect(result.data.email).toBe('ada@example.com')
      expect(result.data.picture).toBe('')
      expect(result.data.gender).toBe('')
      expect(result.data.experience).toEqual([])
    }
  })

  it('rejects a missing name or invalid email after trim', () => {
    expect(parseProfile({ name: '   ' }).success).toBe(false)
    expect(parseProfile({ email: 'not-an-email' }).success).toBe(false)
    expect(parseProfile({ email: ' ada@example.com ' }).success).toBe(true)
  })

  it('normalizes gender to M/F and rejects other values', () => {
    expect(parseProfile({ gender: 'm' }).success).toBe(true)
    expect(parseProfile({ gender: ' F ' }).success).toBe(true)
    expect(parseProfile({ gender: '' }).success).toBe(true)
    expect(parseProfile({ gender: 'X' }).success).toBe(false)

    const male = parseProfile({ gender: 'm' })
    if (male.success) expect(male.data.gender).toBe('M')
  })

  it('requires a UUID cohort id', () => {
    expect(parseProfile({ cohortId: 'not-a-uuid' }).success).toBe(false)
    expect(parseProfile({ cohortId }).success).toBe(true)
  })
})
