import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getMobileDbMock } = vi.hoisted(() => ({
  getMobileDbMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/mobile/mobileApiUtils', async () => {
  const actual = await vi.importActual<typeof import('@/lib/mobile/mobileApiUtils')>(
    '@/lib/mobile/mobileApiUtils',
  )
  return { ...actual, getMobileDb: getMobileDbMock }
})

import { listMeetings, updateMeetingAttendance } from './meetingService'

function listQuery(result: {
  data: Record<string, unknown>[] | null
  error: { message: string } | null
  count: number | null
}) {
  const query = {
    select: vi.fn(),
    order: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    range: vi.fn().mockResolvedValue(result),
  }
  query.select.mockReturnValue(query)
  query.order.mockReturnValue(query)
  query.gte.mockReturnValue(query)
  query.lte.mockReturnValue(query)
  return query
}

describe('listMeetings date range', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('sorts an unfiltered list newest first and does not apply a date bound', async () => {
    const query = listQuery({
      data: [
        {
          id: 'm1',
          title: null,
          date: null,
          google_group_id: null,
          description: null,
          meeting_link: null,
          cover_image_url: null,
          feedback_form: null,
          feedback_email_sent_at: null,
          attendance: [2, 0, -1, 'x', 2, 1],
        },
      ],
      error: null,
      count: null,
    })
    getMobileDbMock.mockReturnValue({ from: vi.fn().mockReturnValue(query) })

    const result = await listMeetings(2, 10)

    expect(query.order).toHaveBeenCalledWith('date', { ascending: false })
    expect(query.gte).not.toHaveBeenCalled()
    expect(query.lte).not.toHaveBeenCalled()
    expect(query.range).toHaveBeenCalledWith(10, 19)
    expect(result.data).toEqual([
      {
        id: 'm1',
        title: '',
        date: '',
        googleGroupId: '',
        description: '',
        meetingLink: '',
        coverImageUrl: '',
        feedbackForm: undefined,
        feedbackEmailSentAt: undefined,
        attendance: [1, 2, 2],
      },
    ])
    expect(result.pagination).toMatchObject({
      page: 2,
      limit: 10,
      totalCount: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: true,
    })
  })

  it('sorts a from-bounded list oldest first and applies only the lower bound', async () => {
    const query = listQuery({ data: [], error: null, count: 0 })
    getMobileDbMock.mockReturnValue({ from: vi.fn().mockReturnValue(query) })

    await listMeetings(1, 20, { from: '2026-04-01T00:00:00.000Z' })

    expect(query.order).toHaveBeenCalledWith('date', { ascending: true })
    expect(query.gte).toHaveBeenCalledWith('date', '2026-04-01T00:00:00.000Z')
    expect(query.lte).not.toHaveBeenCalled()
  })

  it('keeps newest-first order when only an upper bound is set', async () => {
    const query = listQuery({ data: [], error: null, count: 0 })
    getMobileDbMock.mockReturnValue({ from: vi.fn().mockReturnValue(query) })

    await listMeetings(1, 20, { to: '2026-04-30T00:00:00.000Z' })

    expect(query.order).toHaveBeenCalledWith('date', { ascending: false })
    expect(query.gte).not.toHaveBeenCalled()
    expect(query.lte).toHaveBeenCalledWith('date', '2026-04-30T00:00:00.000Z')
  })

  it('applies both bounds and sorts oldest first when from and to are set', async () => {
    const query = listQuery({ data: [], error: null, count: 0 })
    getMobileDbMock.mockReturnValue({ from: vi.fn().mockReturnValue(query) })

    await listMeetings(1, 20, {
      from: '2026-04-01T00:00:00.000Z',
      to: '2026-04-30T00:00:00.000Z',
    })

    expect(query.order).toHaveBeenCalledWith('date', { ascending: true })
    expect(query.gte).toHaveBeenCalledWith('date', '2026-04-01T00:00:00.000Z')
    expect(query.lte).toHaveBeenCalledWith('date', '2026-04-30T00:00:00.000Z')
  })

  it('treats empty from and to as an unfiltered newest-first list', async () => {
    const query = listQuery({ data: [], error: null, count: 0 })
    getMobileDbMock.mockReturnValue({ from: vi.fn().mockReturnValue(query) })

    await listMeetings(1, 20, { from: '', to: '' })

    expect(query.order).toHaveBeenCalledWith('date', { ascending: false })
    expect(query.gte).not.toHaveBeenCalled()
    expect(query.lte).not.toHaveBeenCalled()
  })

  it('throws a mobile service error when the list query fails', async () => {
    const query = listQuery({
      data: null,
      error: { message: 'meetings down' },
      count: null,
    })
    getMobileDbMock.mockReturnValue({ from: vi.fn().mockReturnValue(query) })

    await expect(listMeetings()).rejects.toMatchObject({
      name: 'MobileServiceError',
      message: 'Could not load meetings.',
      status: 500,
      code: 'INTERNAL_ERROR',
    })
  })
})

describe('updateMeetingAttendance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('stores only positive numeric ids in ascending order', async () => {
    const row = {
      id: 'm1',
      title: 'Standup',
      date: '2026-04-02T00:00:00+05:30',
      google_group_id: 'g1',
      description: '',
      meeting_link: '',
      cover_image_url: '',
      feedback_form: null,
      feedback_email_sent_at: null,
      attendance: [1, 3],
    }
    const query = {
      update: vi.fn(),
      eq: vi.fn(),
      select: vi.fn(),
      maybeSingle: vi.fn().mockResolvedValue({ data: row, error: null }),
    }
    query.update.mockReturnValue(query)
    query.eq.mockReturnValue(query)
    query.select.mockReturnValue(query)
    getMobileDbMock.mockReturnValue({ from: vi.fn().mockReturnValue(query) })

    const saved = await updateMeetingAttendance('m1', [3, 0, Number.NaN, -2, 1])

    expect(query.update).toHaveBeenCalledWith({ attendance: [1, 3] })
    expect(query.eq).toHaveBeenCalledWith('id', 'm1')
    expect(saved.attendance).toEqual([1, 3])
  })

  it('returns not found when the attendance update matches no meeting', async () => {
    const query = {
      update: vi.fn(),
      eq: vi.fn(),
      select: vi.fn(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }
    query.update.mockReturnValue(query)
    query.eq.mockReturnValue(query)
    query.select.mockReturnValue(query)
    getMobileDbMock.mockReturnValue({ from: vi.fn().mockReturnValue(query) })

    await expect(updateMeetingAttendance('missing', [1])).rejects.toMatchObject({
      message: 'Meeting not found',
      status: 404,
      code: 'NOT_FOUND',
    })
  })
})
