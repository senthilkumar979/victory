import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  extractGoogleDocId,
  getAssignmentDueStatus,
  getGoogleDocPreviewUrl,
  isPastDue,
} from './assignmentUtils'

describe('assignmentUtils due date helpers', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('classifies upcoming, due soon, and past due windows', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-28T12:00:00.000Z'))

    expect(getAssignmentDueStatus('2026-08-10T12:00:00.000Z')).toBe('upcoming')
    expect(getAssignmentDueStatus('2026-07-30T12:00:00.000Z')).toBe('due_soon')
    expect(getAssignmentDueStatus('2026-07-27T12:00:00.000Z')).toBe('past_due')
  })

  it('detects past-due deadlines with isPastDue', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-28T12:00:00.000Z'))

    expect(isPastDue('2026-07-28T11:59:59.000Z')).toBe(true)
    expect(isPastDue('2026-07-28T12:00:01.000Z')).toBe(false)
  })
})

describe('assignmentUtils google doc helpers', () => {
  it('extracts document ids and builds preview urls', () => {
    const url =
      'https://docs.google.com/document/d/abcDEF123_-xyz/edit?usp=sharing'

    expect(extractGoogleDocId(url)).toBe('abcDEF123_-xyz')
    expect(getGoogleDocPreviewUrl(url)).toBe(
      'https://docs.google.com/document/d/abcDEF123_-xyz/preview',
    )
  })

  it('returns null for non-google-doc urls', () => {
    expect(extractGoogleDocId('https://example.com/doc')).toBeNull()
    expect(getGoogleDocPreviewUrl('https://github.com/org/repo')).toBeNull()
  })
})
