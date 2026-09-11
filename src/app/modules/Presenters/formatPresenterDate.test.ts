import { describe, expect, it } from 'vitest'

import { formatPresenterDateDisplay } from './formatPresenterDate'

describe('formatPresenterDateDisplay', () => {
  it('returns an em dash for empty or whitespace-only values', () => {
    expect(formatPresenterDateDisplay('')).toBe('—')
    expect(formatPresenterDateDisplay('   ')).toBe('—')
  })

  it('returns the original string when the date is invalid', () => {
    expect(formatPresenterDateDisplay('not-a-date')).toBe('not-a-date')
  })

  it('formats a UTC instant in IST calendar parts', () => {
    // 18:30 UTC on 15 Mar is midnight IST on 16 Mar.
    expect(formatPresenterDateDisplay('2026-03-15T18:30:00.000Z')).toBe(
      'Mar 16, 2026',
    )
    expect(formatPresenterDateDisplay(' 2026-01-01T00:00:00.000Z ')).toBe(
      'Jan 1, 2026',
    )
  })
})
