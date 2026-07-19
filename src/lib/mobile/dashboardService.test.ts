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
  error: ({ message: string } & Partial<Record<'code' | 'details', string>>) | null
}

interface DashboardResults {
  students: QueryResult
  meetings: QueryResult
  announcements: QueryResult
  assignments: QueryResult
  submissions: QueryResult
}

function createDashboardDb(overrides: Partial<DashboardResults> = {}) {
  const success = { count: 0, data: null, error: null }
  const results: DashboardResults = {
    students: { ...success, count: 12 },
    meetings: { ...success, count: 3 },
    announcements: {
      ...success,
      data: [{ id: 1, title: 'Important update' }],
    },
    assignments: { ...success, count: 4 },
    submissions: { ...success, count: 5 },
    ...overrides,
  }
  const students = {
    select: vi.fn().mockResolvedValue(results.students),
  }
  const meetings = {
    select: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn().mockResolvedValue(results.meetings),
  }
  meetings.select.mockReturnValue(meetings)
  meetings.gte.mockReturnValue(meetings)
  const announcements = {
    select: vi.fn(),
    order: vi.fn(),
    limit: vi.fn().mockResolvedValue(results.announcements),
  }
  announcements.select.mockReturnValue(announcements)
  announcements.order.mockReturnValue(announcements)
  const assignments = {
    select: vi.fn().mockResolvedValue(results.assignments),
  }
  const submissions = {
    select: vi.fn(),
    is: vi.fn().mockResolvedValue(results.submissions),
  }
  submissions.select.mockReturnValue(submissions)
  const queries = {
    students,
    meetings,
    announcements,
    assignments,
    assignment_submissions: submissions,
  }
  const from = vi.fn((table: keyof typeof queries) => queries[table])

  return { db: { from }, submissions }
}

describe('getAdminDashboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('counts submissions that have not been reviewed', async () => {
    const { db, submissions } = createDashboardDb()
    getMobileDbMock.mockReturnValue(db)

    const dashboard = await getAdminDashboard()

    expect(submissions.is).toHaveBeenCalledWith('reviewed_at', null)
    expect(dashboard).toEqual({
      studentCount: 12,
      meetingsTodayCount: 3,
      openAssignmentsCount: 4,
      pendingSubmissionsCount: 5,
      recentAnnouncements: [{ id: 1, title: 'Important update' }],
    })
  })

  it('returns the dashboard with zero pending submissions when that count fails', async () => {
    const pendingError = { message: 'column is unavailable', code: '42703' }
    const { db } = createDashboardDb({
      submissions: { count: null, data: null, error: pendingError },
    })
    getMobileDbMock.mockReturnValue(db)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await expect(getAdminDashboard()).resolves.toMatchObject({
      studentCount: 12,
      pendingSubmissionsCount: 0,
    })
    expect(consoleError).toHaveBeenCalledWith(
      '[mobile/dashboardService] pending submissions',
      pendingError,
    )
  })

  it('throws a service error with database details when a critical query fails', async () => {
    const studentsError = {
      message: 'students query failed',
      code: 'XX000',
      details: 'database unavailable',
    }
    const { db } = createDashboardDb({
      students: { count: null, data: null, error: studentsError },
    })
    getMobileDbMock.mockReturnValue(db)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await expect(getAdminDashboard()).rejects.toMatchObject({
      name: 'MobileServiceError',
      message: 'Could not load dashboard.',
      status: 500,
      code: 'INTERNAL_ERROR',
      details: [studentsError],
    })
  })
})
