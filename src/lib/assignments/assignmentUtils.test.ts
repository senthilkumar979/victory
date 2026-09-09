import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  extractGoogleDocId,
  formatDueDate,
  getAssignmentDueStatus,
  getGoogleDocPreviewUrl,
  isPastDue,
} from './assignmentUtils'

const NOW = new Date('2026-06-10T12:00:00.000Z')

describe('getAssignmentDueStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns past_due after the due instant', () => {
    expect(getAssignmentDueStatus('2026-06-10T11:59:59.000Z')).toBe('past_due')
    expect(isPastDue('2026-06-10T11:59:59.000Z')).toBe(true)
  })

  it('returns due_soon within 72 hours and upcoming after that', () => {
    expect(getAssignmentDueStatus('2026-06-13T12:00:00.000Z')).toBe('due_soon')
    expect(getAssignmentDueStatus('2026-06-13T12:00:01.000Z')).toBe('upcoming')
    expect(isPastDue('2026-06-13T12:00:00.000Z')).toBe(false)
  })
})

describe('extractGoogleDocId', () => {
  it('extracts a document id and builds a preview url', () => {
    const url =
      'https://docs.google.com/document/d/abcXYZ-123_456/edit?usp=sharing'

    expect(extractGoogleDocId(url)).toBe('abcXYZ-123_456')
    expect(getGoogleDocPreviewUrl(url)).toBe(
      'https://docs.google.com/document/d/abcXYZ-123_456/preview',
    )
  })

  it('returns null for missing or non-docs urls', () => {
    expect(extractGoogleDocId('')).toBeNull()
    expect(extractGoogleDocId('https://drive.google.com/file/d/abc/view')).toBeNull()
    expect(getGoogleDocPreviewUrl('https://example.com/doc')).toBeNull()
  })
})

describe('formatDueDate', () => {
  it('formats the instant in Asia/Kolkata', () => {
    const formatted = formatDueDate('2026-06-15T10:00:00.000Z')
    expect(formatted).toMatch(/15/)
    expect(formatted).toMatch(/Jun/i)
    expect(formatted).toMatch(/2026/)
    expect(formatted).toMatch(/3:30/)
  })
})
