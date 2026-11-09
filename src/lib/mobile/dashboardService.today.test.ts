import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getAdminDashboard } from './dashboardService'

const { getMobileDbMock } = vi.hoisted(() => ({
  getMobileDbMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/mobile/mobileApiUtils', () => ({
  getMobileDb: getMobileDbMock,
  MobileServiceError: class MobileServiceError extends Error {
    constructor(
      message: string,
      public status: number,
      public code: string,
      public details?: unknown,
    ) {
      super(message)
      this.name = 'MobileServiceError'
    }
  },
}))

interface QueryResult {
  count: number | null
  data: unknown[] | null
  error: { message: string; code?: string; details?: string } | null
}

function fluent(steps: string[], terminal: string, resolved: QueryResult) {
  const node: Record<string, ReturnType<typeof vi.fn>> = {}
  for (const step of steps) node[step] = vi.fn(() => node)
  node[terminal] = vi.fn().mockResolvedValue(resolved)
  return node
}

function createDashboardDb(overrides: Partial<Record<string, QueryResult>> = {}) {
  const ok = { count: 0, data: null, error: null }
  const results: Record<string, QueryResult> = {
    students: { ...ok, count: 4 },
    meetings: { ...ok, count: 2 },
    announcements: { ...ok, data: [{ id: 9, title: 'Week note' }] },
    assignments: { ...ok, count: 6 },
    submissions: { ...ok, count: 1 },
    ...overrides,
  }
  const meetings = fluent(['select', 'gte'], 'lte', results.meetings)
  const announcements = fluent(['select', 'order'], 'limit', results.announcements)
  const submissions = fluent(['select'], 'is', results.submissions)
  const queries: Record<string, unknown> = {
    students: fluent([], 'select', results.students),
    meetings,
    announcements,
    assignments: fluent([], 'select', results.assignments),
    assignment_submissions: submissions,
  }

  return {
    db: { from: vi.fn((table: string) => queries[table]) },
    meetings,
    submissions,
  }
}

describe('getAdminDashboard day window and degraded counts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('counts meetings on the current UTC day and unreviewed submissions', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-01T02:15:00.000Z'))
    try {
      const { db, meetings, submissions } = createDashboardDb()
      getMobileDbMock.mockReturnValue(db)
      await getAdminDashboard()
      expect(meetings.gte).toHaveBeenCalledWith('date', '2026-03-01T00:00:00.000Z')
      expect(meetings.lte).toHaveBeenCalledWith('date', '2026-03-01T23:59:59.999Z')
      expect(submissions.is).toHaveBeenCalledWith('reviewed_at', null)
    } finally {
      vi.useRealTimers()
    }
  })

  it('coalesces null counts and a null announcement list to empty values', async () => {
    const empty = { count: null, data: null, error: null }
    const { db } = createDashboardDb({
      students: empty,
      meetings: empty,
      announcements: empty,
      assignments: empty,
      submissions: empty,
    })
    getMobileDbMock.mockReturnValue(db)

    await expect(getAdminDashboard()).resolves.toEqual({
      studentCount: 0,
      meetingsTodayCount: 0,
      openAssignmentsCount: 0,
      pendingSubmissionsCount: 0,
      recentAnnouncements: [],
    })
  })

  it('fails the dashboard when meetings fail, even if pending submissions also fail', async () => {
    const meetingsError = {
      message: 'meetings unavailable',
      code: 'XX000',
      details: 'timeout',
    }
    const { db } = createDashboardDb({
      meetings: { count: null, data: null, error: meetingsError },
      submissions: {
        count: 9,
        data: null,
        error: { message: 'reviewed_at missing', code: '42703' },
      },
    })
    getMobileDbMock.mockReturnValue(db)

    await expect(getAdminDashboard()).rejects.toMatchObject({
      name: 'MobileServiceError',
      message: 'Could not load dashboard.',
      status: 500,
      code: 'INTERNAL_ERROR',
      details: [meetingsError],
    })
  })

  it('returns zero pending submissions when that count fails and other queries succeed', async () => {
    const { db } = createDashboardDb({
      submissions: {
        count: 9,
        data: null,
        error: { message: 'reviewed_at missing' },
      },
    })
    getMobileDbMock.mockReturnValue(db)

    await expect(getAdminDashboard()).resolves.toMatchObject({
      studentCount: 4,
      meetingsTodayCount: 2,
      openAssignmentsCount: 6,
      pendingSubmissionsCount: 0,
    })
  })
})
