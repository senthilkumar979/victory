import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getAssignmentDueStatus, isPastDue } from './assignmentUtils'

const DUE_INSTANT = '2026-06-10T12:00:00.000Z'

describe('assignment deadline instant', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(DUE_INSTANT))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('keeps the exact due instant open and due soon', () => {
    expect(isPastDue(DUE_INSTANT)).toBe(false)
    expect(getAssignmentDueStatus(DUE_INSTANT)).toBe('due_soon')
  })

  it('closes the deadline one millisecond later', () => {
    vi.setSystemTime(new Date('2026-06-10T12:00:00.001Z'))

    expect(isPastDue(DUE_INSTANT)).toBe(true)
    expect(getAssignmentDueStatus(DUE_INSTANT)).toBe('past_due')
  })
})
