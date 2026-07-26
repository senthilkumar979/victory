import { describe, expect, it } from 'vitest'

import { safeTrimmedString } from './safeTrimmedString'

describe('safeTrimmedString', () => {
  it('returns trimmed non-empty strings', () => {
    expect(safeTrimmedString('  abc  ')).toBe('abc')
  })

  it('returns undefined for blank strings', () => {
    expect(safeTrimmedString('')).toBeUndefined()
    expect(safeTrimmedString('   ')).toBeUndefined()
  })

  it('returns undefined for non-strings without throwing', () => {
    expect(safeTrimmedString(undefined)).toBeUndefined()
    expect(safeTrimmedString(null)).toBeUndefined()
    expect(safeTrimmedString(123)).toBeUndefined()
    expect(safeTrimmedString(true)).toBeUndefined()
    expect(safeTrimmedString({})).toBeUndefined()
    expect(safeTrimmedString([])).toBeUndefined()
  })
})
