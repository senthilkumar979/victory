import { describe, expect, it } from 'vitest'

import {
  dateFromIST,
  dateToISTParts,
  toISTISOString,
  toISTTimestamptz,
} from './dateISTUtils'

describe('IST calendar boundaries', () => {
  it('keeps a UTC instant one second before IST midnight on the previous day', () => {
    expect(toISTTimestamptz('2026-02-28T18:29:59.999Z')).toBe(
      '2026-02-28T23:59:00+05:30',
    )
    expect(toISTISOString(new Date('2026-02-28T18:29:59.999Z'))).toBe(
      '2026-02-28T23:59:00+05:30',
    )
    expect(dateToISTParts(new Date('2026-02-28T18:29:59.999Z'))).toEqual({
      y: 2026,
      m: 1,
      d: 28,
      h: 23,
      min: 59,
    })
  })

  it('rolls UTC 18:30 onto the next IST calendar day, including across years', () => {
    expect(toISTTimestamptz('2026-02-28T18:30:00.000Z')).toBe(
      '2026-03-01T00:00:00+05:30',
    )
    expect(toISTTimestamptz('2025-12-31T18:30:00.000Z')).toBe(
      '2026-01-01T00:00:00+05:30',
    )
  })

  it('round-trips an IST month-start midnight back to the previous UTC day', () => {
    const utc = dateFromIST(2026, 2, 1, 0, 0)

    expect(utc.toISOString()).toBe('2026-02-28T18:30:00.000Z')
    expect(dateToISTParts(utc)).toEqual({
      y: 2026,
      m: 2,
      d: 1,
      h: 0,
      min: 0,
    })
    expect(toISTTimestamptz(utc.toISOString())).toBe('2026-03-01T00:00:00+05:30')
  })
})
