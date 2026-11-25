import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

import { getAdminDashboard } from './dashboardService'

interface QueryResult {
  count?: number | null
  data?: unknown
  error: { message: string; code?: string; details?: string } | null
}

function dashboardDb(results: {
  students: QueryResult
  meetings: QueryResult
  announcements: QueryResult
  assignments: QueryResult
  submissions: QueryResult
}) {
  const meetings = { gte: vi.fn(), lte: vi.fn() }
  const announcements = { order: vi.fn(), limit: vi.fn() }
  const submissions = { is: vi.fn() }

  const from = vi.fn((table: string) => {
    if (table === 'students' || table === 'assignments') {
      const result = table === 'students' ? results.students : results.assignments
      return { select: vi.fn().mockResolvedValue(result) }
    }

    if (table === 'meetings') {
      const query = { select: vi.fn(), gte: meetings.gte, lte: meetings.lte }
      query.select.mockReturnValue(query)
      meetings.gte.mockReturnValue(query)
      meetings.lte.mockResolvedValue(results.meetings)
      return query
    }

    if (table === 'announcements') {
      const query = {
        select: vi.fn(),
        order: announcements.order,
        limit: announcements.limit,
      }
      query.select.mockReturnValue(query)
      announcements.order.mockReturnValue(query)
      announcements.limit.mockResolvedValue(results.announcements)
      return query
    }

    const query = { select: vi.fn(), is: submissions.is }
    query.select.mockReturnValue(query)
    submissions.is.mockResolvedValue(results.submissions)
    return query
  })

  return { from, meetings, announcements, submissions }
}

const healthy = {
  students: { count: 4, error: null },
  meetings: { count: 2, error: null },
  announcements: {
    data: [{ id: 'a1', title: 'Hello', description: 'Hi', created_at: '2026-03-31' }],
    error: null,
  },
  assignments: { count: 6, error: null },
  submissions: { count: 3, error: null },
}

describe('getAdminDashboard pending counts', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-31T23:30:00.000Z'))
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('uses the UTC day and treats unreviewed submissions as pending', async () => {
    const db = dashboardDb(healthy)
    getMobileDbMock.mockReturnValue({ from: db.from })

    await expect(getAdminDashboard()).resolves.toEqual({
      studentCount: 4,
      meetingsTodayCount: 2,
      openAssignmentsCount: 6,
      pendingSubmissionsCount: 3,
      recentAnnouncements: healthy.announcements.data,
    })

    expect(db.meetings.gte).toHaveBeenCalledWith('date', '2026-03-31T00:00:00.000Z')
    expect(db.meetings.lte).toHaveBeenCalledWith('date', '2026-03-31T23:59:59.999Z')
    expect(db.submissions.is).toHaveBeenCalledWith('reviewed_at', null)
    expect(db.announcements.limit).toHaveBeenCalledWith(5)
  })

  it('keeps the rest of the dashboard when the pending count fails', async () => {
    const db = dashboardDb({
      ...healthy,
      submissions: { count: 9, error: { message: 'submissions down' } },
    })
    getMobileDbMock.mockReturnValue({ from: db.from })

    await expect(getAdminDashboard()).resolves.toMatchObject({
      studentCount: 4,
      meetingsTodayCount: 2,
      openAssignmentsCount: 6,
      pendingSubmissionsCount: 0,
      recentAnnouncements: healthy.announcements.data,
    })
  })

  it('fails closed on a meetings error and ignores a stale pending count', async () => {
    const db = dashboardDb({
      ...healthy,
      meetings: {
        count: 0,
        error: { message: 'meetings down', code: 'XX000', details: 'timeout' },
      },
      submissions: { count: 9, error: { message: 'submissions down' } },
    })
    getMobileDbMock.mockReturnValue({ from: db.from })

    await expect(getAdminDashboard()).rejects.toMatchObject({
      message: 'Could not load dashboard.',
      status: 500,
      code: 'INTERNAL_ERROR',
      details: [{ message: 'meetings down', code: 'XX000', details: 'timeout' }],
    })
  })

  it('turns null counts and a null announcement list into empty totals', async () => {
    const db = dashboardDb({
      students: { count: null, error: null },
      meetings: { count: null, error: null },
      announcements: { data: null, error: null },
      assignments: { count: null, error: null },
      submissions: { count: null, error: null },
    })
    getMobileDbMock.mockReturnValue({ from: db.from })

    await expect(getAdminDashboard()).resolves.toEqual({
      studentCount: 0,
      meetingsTodayCount: 0,
      openAssignmentsCount: 0,
      pendingSubmissionsCount: 0,
      recentAnnouncements: [],
    })
  })
})
