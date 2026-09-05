import { describe, expect, it } from 'vitest'

import { hasMentorBridgeExp } from './profile.utils'

describe('hasMentorBridgeExp', () => {
  it('rejects missing or empty experience objects', () => {
    expect(hasMentorBridgeExp(undefined)).toBe(false)
    expect(hasMentorBridgeExp(null)).toBe(false)
    expect(hasMentorBridgeExp({})).toBe(false)
    expect(hasMentorBridgeExp({ company: '', role: '', summary: '' })).toBe(
      false,
    )
  })

  it('accepts an object with any of company, role, or summary filled', () => {
    expect(hasMentorBridgeExp({ company: 'MentorBridge' })).toBe(true)
    expect(hasMentorBridgeExp({ company: '', role: 'Intern' })).toBe(true)
    expect(hasMentorBridgeExp({ company: '', summary: 'Built APIs' })).toBe(true)
  })

  it('requires a company key so unrelated records are not treated as MentorBridge exp', () => {
    expect(hasMentorBridgeExp({ role: 'Intern', summary: 'Built APIs' })).toBe(
      false,
    )
  })
})
