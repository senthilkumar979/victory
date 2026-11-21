import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: null,
}))

import type { Assignment, AssignmentStats } from '@/types/assignment.types'
import { enrichAssignmentListItem } from './assignmentService'

const NOW = '2026-06-10T12:00:00.000Z'
const DUE_AT_72_HOURS = '2026-06-13T12:00:00.000Z'
const DUE_ONE_MS_AGO = '2026-06-10T11:59:59.999Z'

const STATS: AssignmentStats = {
  totalStudents: 3,
  submittedCount: 1,
  pendingCount: 2,
  submissionPercentage: 33,
}

function assignment(dueDate: string): Assignment {
  return {
    id: 'assignment-1',
    title: 'Lab',
    description: 'Build the API',
    cohortId: 'cohort-9',
    category: 'Backend',
    googleGroupId: 'group-1',
    attachments: null,
    dueDate,
    createdBy: 'admin@example.com',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  }
}

describe('enrichAssignmentListItem due status', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(NOW))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('stamps due soon at 72 hours and past due one millisecond late', () => {
    const openItem = enrichAssignmentListItem(
      assignment(DUE_AT_72_HOURS),
      STATS,
    )

    expect(openItem.dueStatus).toBe('due_soon')
    expect(openItem.stats).toBe(STATS)
    expect(openItem.mySubmissionStatus).toBeUndefined()

    const closedItem = enrichAssignmentListItem(
      assignment(DUE_ONE_MS_AGO),
      STATS,
      'not_submitted',
    )

    expect(closedItem.dueStatus).toBe('past_due')
    expect(closedItem.mySubmissionStatus).toBe('not_submitted')
  })
})
