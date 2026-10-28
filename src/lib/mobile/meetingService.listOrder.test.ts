import { beforeEach, describe, expect, it, vi } from 'vitest'

const mobileApiMocks = vi.hoisted(() => ({
  getMobileDb: vi.fn(),
}))

vi.mock('server-only', () => ({}))
vi.mock('@/lib/mobile/mobileApiUtils', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@/lib/mobile/mobileApiUtils')>()

  return { ...original, getMobileDb: mobileApiMocks.getMobileDb }
})

import { listMeetings } from '@/lib/mobile/meetingService'

const meetingRow = {
  id: 'meeting-1',
  title: 'Upcoming session',
  date: '2026-07-19T10:00:00.000Z',
  google_group_id: 'group-1',
  description: 'Calendar order',
  meeting_link: 'https://meet.example.com/meeting-1',
  cover_image_url: '',
  feedback_form: null,
  feedback_email_sent_at: null,
  attendance: null,
}

describe('listMeetings date order', () => {
  const range = vi.fn()
  const lte = vi.fn()
  const gte = vi.fn()
  const order = vi.fn()
  const select = vi.fn()
  const from = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    range.mockResolvedValue({ data: [meetingRow], error: null, count: 4 })
    lte.mockReturnValue({ range })
    gte.mockReturnValue({ lte, range })
    order.mockReturnValue({ gte, lte, range })
    select.mockReturnValue({ order })
    from.mockReturnValue({ select })
    mobileApiMocks.getMobileDb.mockReturnValue({ from })
  })

  it('sorts a lower bound alone ascending and does not apply an upper bound', async () => {
    await listMeetings(1, 20, { from: '2026-07-01' })

    expect(order).toHaveBeenCalledWith('date', { ascending: true })
    expect(gte).toHaveBeenCalledWith('date', '2026-07-01')
    expect(lte).not.toHaveBeenCalled()
    expect(range).toHaveBeenCalledWith(0, 19)
  })

  it('keeps the default descending order when no range is requested', async () => {
    await listMeetings()

    expect(order).toHaveBeenCalledWith('date', { ascending: false })
    expect(gte).not.toHaveBeenCalled()
    expect(lte).not.toHaveBeenCalled()
    expect(range).toHaveBeenCalledWith(0, 19)
  })

  it('does not reverse or filter when date bounds are blank', async () => {
    await listMeetings(1, 20, { from: '', to: '' })

    expect(order).toHaveBeenCalledWith('date', { ascending: false })
    expect(gte).not.toHaveBeenCalled()
    expect(lte).not.toHaveBeenCalled()
  })

  it('uses the returned row count when the database omits a total', async () => {
    range.mockResolvedValue({
      data: [meetingRow, { ...meetingRow, id: 'meeting-2' }],
      error: null,
      count: null,
    })

    const result = await listMeetings()

    expect(result.pagination).toEqual({
      page: 1,
      limit: 20,
      totalCount: 2,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    })
  })

  it('hides database failures behind a generic meetings error', async () => {
    const databaseError = { message: 'timeout' }
    range.mockResolvedValue({ data: null, error: databaseError, count: null })
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await expect(listMeetings()).rejects.toMatchObject({
      name: 'MobileServiceError',
      message: 'Could not load meetings.',
      status: 500,
      code: 'INTERNAL_ERROR',
    })
    expect(consoleError).toHaveBeenCalledWith(
      '[mobile/meetingService.list]',
      databaseError,
    )
    consoleError.mockRestore()
  })
})
