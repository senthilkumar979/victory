import { describe, expect, it } from 'vitest'

import { formatAwardDateDisplay } from './formatAwardDate'

describe('formatAwardDateDisplay', () => {
  it('formats a UTC instant in IST and crosses midnight', () => {
    expect(formatAwardDateDisplay('2026-01-15T18:30:00.000Z')).toBe('Jan 16, 2026')
    expect(formatAwardDateDisplay('2026-01-15T18:29:00.000Z')).toBe('Jan 15, 2026')
  })

  it('returns an em dash for blank values and the original string for invalid dates', () => {
    expect(formatAwardDateDisplay('   ')).toBe('—')
    expect(formatAwardDateDisplay('not-a-date')).toBe('not-a-date')
  })
})
