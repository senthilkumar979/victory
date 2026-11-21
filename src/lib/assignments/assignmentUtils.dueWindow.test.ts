import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  extractGoogleDocId,
  getAssignmentDueStatus,
  getGoogleDocPreviewUrl,
  isPastDue,
} from './assignmentUtils'

const NOW = '2026-06-10T12:00:00.000Z'
const DUE_AT_72_HOURS = '2026-06-13T12:00:00.000Z'
const DUE_JUST_OUTSIDE_72_HOURS = '2026-06-13T12:00:00.001Z'
const DUE_ONE_MS_AGO = '2026-06-10T11:59:59.999Z'
const DOC_ID = 'abc123_XYZ-9'

describe('assignment due window', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(NOW))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('treats the exact 72-hour mark as due soon and the next millisecond as upcoming', () => {
    expect(getAssignmentDueStatus(DUE_AT_72_HOURS)).toBe('due_soon')
    expect(isPastDue(DUE_AT_72_HOURS)).toBe(false)

    expect(getAssignmentDueStatus(DUE_JUST_OUTSIDE_72_HOURS)).toBe('upcoming')
    expect(isPastDue(DUE_JUST_OUTSIDE_72_HOURS)).toBe(false)
  })

  it('keeps a due instant open and closes it one millisecond later', () => {
    expect(getAssignmentDueStatus(NOW)).toBe('due_soon')
    expect(isPastDue(NOW)).toBe(false)

    expect(getAssignmentDueStatus(DUE_ONE_MS_AGO)).toBe('past_due')
    expect(isPastDue(DUE_ONE_MS_AGO)).toBe(true)
  })
})

describe('Google Doc preview URLs', () => {
  it('builds a preview from the document id and drops the original query and host', () => {
    const editUrl = `https://docs.google.com/document/d/${DOC_ID}/edit?usp=sharing#heading`
    const hostileUrl = `https://evil.example/redirect?next=docs.google.com/document/d/${DOC_ID}&to=https://evil.example`

    expect(extractGoogleDocId(editUrl)).toBe(DOC_ID)
    expect(getGoogleDocPreviewUrl(editUrl)).toBe(
      `https://docs.google.com/document/d/${DOC_ID}/preview`,
    )
    expect(getGoogleDocPreviewUrl(hostileUrl)).toBe(
      `https://docs.google.com/document/d/${DOC_ID}/preview`,
    )
  })

  it('rejects spreadsheet links, non-doc hosts, and a document path with no id', () => {
    expect(
      extractGoogleDocId('https://docs.google.com/spreadsheets/d/abc123'),
    ).toBeNull()
    expect(getGoogleDocPreviewUrl('https://example.com/not-a-doc')).toBeNull()
    expect(
      extractGoogleDocId('https://docs.google.com/document/d/'),
    ).toBeNull()
    expect(getGoogleDocPreviewUrl('https://docs.google.com/document/d/')).toBe(
      null,
    )
  })
})
