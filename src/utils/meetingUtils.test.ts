import { describe, expect, it } from 'vitest'

import {
  formatDate,
  formatDateWithoutTime,
  formatTime,
  stripHtml,
} from './meetingUtils'

describe('stripHtml', () => {
  it('returns an empty string for blank input', () => {
    expect(stripHtml('')).toBe('')
  })

  it('strips tags, collapses whitespace, and trims the result', () => {
    expect(stripHtml('<p>Hello   <b>world</b></p>')).toBe('Hello world')
    expect(stripHtml('  <br/>  ')).toBe('')
    expect(stripHtml('<p>Line one</p>\n<p>Line two</p>')).toBe('Line one Line two')
  })
})

describe('meeting date formatters', () => {
  it('returns empty strings for blank timestamps', () => {
    expect(formatDate('')).toBe('')
    expect(formatTime('')).toBe('')
    expect(formatDateWithoutTime('')).toBe('')
  })

  it('formats a UTC instant in IST with a 24-hour clock', () => {
    const iso = '2026-01-15T08:30:00.000Z'
    const withTime = formatDate(iso)
    const timeOnly = formatTime(iso)

    expect(withTime).toMatch(/15/)
    expect(withTime).toMatch(/2026/)
    expect(withTime).toMatch(/14[:.]00/)
    expect(withTime.endsWith(' IST')).toBe(true)
    expect(timeOnly).toMatch(/14[:.]00/)
  })
})
