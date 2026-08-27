import { describe, expect, it } from 'vitest'

import { partnerFormSchema } from './partnerFormSchema'

const basePartner = {
  name: 'Jane Doe',
  company: 'Acme',
  location: 'Chennai',
  primaryEmail: '',
  primaryContact: '',
  secondaryEmail: '',
  secondaryContact: '',
  designation: '',
  category: '',
  description: '',
}

describe('partnerFormSchema', () => {
  it('accepts a partner with only a primary email', () => {
    const result = partnerFormSchema.safeParse({
      ...basePartner,
      primaryEmail: 'jane@acme.com',
    })

    expect(result.success).toBe(true)
  })

  it('accepts a partner with only a primary contact', () => {
    const result = partnerFormSchema.safeParse({
      ...basePartner,
      primaryContact: '+91 98765 43210',
    })

    expect(result.success).toBe(true)
  })

  it('requires name, company, and location even when a contact exists', () => {
    expect(
      partnerFormSchema.safeParse({
        ...basePartner,
        name: '  ',
        primaryEmail: 'jane@acme.com',
      }).success,
    ).toBe(false)
    expect(
      partnerFormSchema.safeParse({
        ...basePartner,
        company: '',
        primaryContact: '123',
      }).success,
    ).toBe(false)
  })

  it('rejects partners with neither email nor contact, including whitespace-only values', () => {
    const empty = partnerFormSchema.safeParse(basePartner)
    const whitespace = partnerFormSchema.safeParse({
      ...basePartner,
      primaryEmail: '   ',
      primaryContact: '   ',
    })

    expect(empty.success).toBe(false)
    expect(whitespace.success).toBe(false)
    if (!empty.success) {
      expect(empty.error.issues[0]?.message).toBe(
        'Either primary email or primary contact is required',
      )
      expect(empty.error.issues[0]?.path).toEqual(['primaryEmail'])
    }
  })
})
