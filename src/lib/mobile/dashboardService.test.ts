import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const dbState = { client: null as unknown }

vi.mock('@/lib/supabaseAdmin', () => ({
  get supabaseAdmin() {
    return dbState.client
  },
}))

import { MobileServiceError } from './mobileApiUtils'
import { getAdminDashboard } from './dashboardService'

interface QueryResult {
  data?: unknown
  error?: { message: string; code?: string; details?: unknown } | null
  count?: number | null
}

function createQuery(result: QueryResult) {
  const query = {
    select: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    is: vi.fn(),
    then(
      onFulfilled?: (value: QueryResult) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) {
      return Promise.resolve(result).then(onFulfilled, onRejected)
    },
  }
  query.select.mockReturnValue(query)
  query.gte.mockReturnValue(query)
  query.lte.mockReturnValue(query)
  query.order.mockReturnValue(query)
  query.limit.mockReturnValue(query)
  query.is.mockReturnValue(query)
  return query
}

function mockTables(results: Record<string, QueryResult>) {
  const queries = Object.fromEntries(
    Object.entries(results).map(([table, result]) => [table, createQuery(result)]),
  )
  dbState.client = {
    from: vi.fn((table: string) => {
      const query = queries[table]
      if (!query) throw new Error(`Unexpected table ${table}`)
      return query
    }),
  }
  return queries
}

describe('getAdminDashboard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-29T15:30:00.000Z'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    dbState.client = null
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('throws when a critical count query fails', async () => {
    mockTables({
      students: { error: { message: 'timeout', code: '57014' }, count: null },
      meetings: { error: null, count: 1 },
      announcements: { data: [], error: null },
      assignments: { error: null, count: 2 },
      assignment_submissions: { error: null, count: 0 },
    })

    await expect(getAdminDashboard()).rejects.toMatchObject({
      name: 'MobileServiceError',
      status: 500,
      code: 'INTERNAL_ERROR',
      message: 'Could not load dashboard.',
    })
    expect(MobileServiceError).toBeDefined()
  })

  it('treats pending-submission failures as zero instead of failing the dashboard', async () => {
    const queries = mockTables({
      students: { error: null, count: 12 },
      meetings: { error: null, count: 1 },
      announcements: {
        data: [{ id: 'a1', title: 'Welcome', description: 'Hi', created_at: '2026-08-29' }],
        error: null,
      },
      assignments: { error: null, count: 4 },
      assignment_submissions: {
        error: { message: 'column missing', code: '42703' },
        count: null,
      },
    })

    await expect(getAdminDashboard()).resolves.toEqual({
      studentCount: 12,
      meetingsTodayCount: 1,
      openAssignmentsCount: 4,
      pendingSubmissionsCount: 0,
      recentAnnouncements: [
        { id: 'a1', title: 'Welcome', description: 'Hi', created_at: '2026-08-29' },
      ],
    })

    expect(queries.meetings.gte).toHaveBeenCalledWith(
      'date',
      '2026-08-29T00:00:00.000Z',
    )
    expect(queries.meetings.lte).toHaveBeenCalledWith(
      'date',
      '2026-08-29T23:59:59.999Z',
    )
    expect(queries.assignment_submissions.is).toHaveBeenCalledWith(
      'reviewed_at',
      null,
    )
  })

  it('coerces null counts to zero on success', async () => {
    mockTables({
      students: { error: null, count: null },
      meetings: { error: null, count: null },
      announcements: { data: null, error: null },
      assignments: { error: null, count: null },
      assignment_submissions: { error: null, count: 3 },
    })

    await expect(getAdminDashboard()).resolves.toEqual({
      studentCount: 0,
      meetingsTodayCount: 0,
      openAssignmentsCount: 0,
      pendingSubmissionsCount: 3,
      recentAnnouncements: [],
    })
  })
})
