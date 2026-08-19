import { describe, expect, it } from 'vitest'

import {
  dateFromIST,
  dateToISTParts,
  toISTISOString,
  toISTTimestamptz,
} from './dateISTUtils'

describe('toISTTimestamptz', () => {
  it('returns an empty string for blank input', () => {
    expect(toISTTimestamptz('')).toBe('')
    expect(toISTTimestamptz('   ')).toBe('')
  })

  it('appends midnight IST for date-only values without converting them', () => {
    expect(toISTTimestamptz('2026-07-19')).toBe('2026-07-19T00:00:00+05:30')
    expect(toISTTimestamptz(' 2026-07-19 ')).toBe('2026-07-19T00:00:00+05:30')
  })

  it('converts UTC and offset ISO timestamps into IST wall time', () => {
    expect(toISTTimestamptz('2026-07-19T09:00:00Z')).toBe(
      '2026-07-19T14:30:00+05:30',
    )
    expect(toISTTimestamptz('2026-07-19T14:30:00+05:30')).toBe(
      '2026-07-19T14:30:00+05:30',
    )
  })

  it('returns the trimmed input when an ISO timestamp is unparseable', () => {
    expect(toISTTimestamptz('  not-a-dateT00:00:00Z ')).toBe(
      'not-a-dateT00:00:00Z',
    )
  })
})

describe('IST date helpers', () => {
  it('round-trips IST parts through UTC', () => {
    const utc = dateFromIST(2026, 6, 19, 14, 30)
    expect(utc.toISOString()).toBe('2026-07-19T09:00:00.000Z')
    expect(dateToISTParts(utc)).toEqual({
      y: 2026,
      m: 6,
      d: 19,
      h: 14,
      min: 30,
    })
    expect(toISTISOString(utc)).toBe('2026-07-19T14:30:00+05:30')
  })
})
