import { describe, expect, it } from 'vitest'

import { contactFormSchema } from '@/lib/contactFormSchema'

const valid = {
  fullName: 'Ada Lovelace',
  company: 'MentorBridge',
  email: 'ada@example.com',
  message: 'I would like to partner.',
}

describe('contactFormSchema', () => {
  it('accepts a complete payload and allows an empty company', () => {
    expect(contactFormSchema.parse(valid)).toEqual(valid)
    expect(
      contactFormSchema.parse({ ...valid, company: '' }),
    ).toEqual({ ...valid, company: '' })
  })

  it('requires a non-empty full name and message within max lengths', () => {
    expect(contactFormSchema.safeParse({ ...valid, fullName: '' }).success).toBe(
      false,
    )
    expect(
      contactFormSchema.safeParse({ ...valid, fullName: 'A'.repeat(201) })
        .success,
    ).toBe(false)
    expect(contactFormSchema.safeParse({ ...valid, message: '' }).success).toBe(
      false,
    )
    expect(
      contactFormSchema.safeParse({ ...valid, message: 'M'.repeat(10001) })
        .success,
    ).toBe(false)
    expect(
      contactFormSchema.safeParse({ ...valid, company: 'C'.repeat(201) }).success,
    ).toBe(false)
  })

  it('rejects invalid emails including padded values', () => {
    expect(
      contactFormSchema.safeParse({ ...valid, email: 'not-an-email' }).success,
    ).toBe(false)
    expect(
      contactFormSchema.safeParse({ ...valid, email: ' ada@example.com ' })
        .success,
    ).toBe(false)
  })
})
