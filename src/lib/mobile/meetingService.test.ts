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
  title: 'Testing date filters',
  date: '2026-07-19T10:00:00.000Z',
  google_group_id: 'group-1',
  description: 'Regression coverage',
  meeting_link: 'https://meet.example.com/meeting-1',
  cover_image_url: 'https://example.com/cover.webp',
  feedback_form: null,
  feedback_email_sent_at: null,
  attendance: [3, 1],
}

describe('listMeetings', () => {
  const range = vi.fn()
  const lte = vi.fn()
  const gte = vi.fn()
  const order = vi.fn()
  const select = vi.fn()
  const from = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    range.mockResolvedValue({ data: [meetingRow], error: null, count: 11 })
    lte.mockReturnValue({ range })
    gte.mockReturnValue({ lte, range })
    order.mockReturnValue({ gte, lte, range })
    select.mockReturnValue({ order })
    from.mockReturnValue({ select })
    mobileApiMocks.getMobileDb.mockReturnValue({ from })
  })

  it('applies both date bounds in ascending order and preserves pagination', async () => {
    const result = await listMeetings(2, 5, {
      from: '2026-07-01',
      to: '2026-07-31',
    })

    expect(order).toHaveBeenCalledWith('date', { ascending: true })
    expect(gte).toHaveBeenCalledWith('date', '2026-07-01')
    expect(lte).toHaveBeenCalledWith('date', '2026-07-31')
    expect(range).toHaveBeenCalledWith(5, 9)
    expect(result.pagination).toMatchObject({
      page: 2,
      limit: 5,
      totalCount: 11,
      totalPages: 3,
    })
    expect(result.data[0]).toMatchObject({
      id: 'meeting-1',
      attendance: [1, 3],
    })
  })

  it('supports an upper bound without changing the default descending order', async () => {
    await listMeetings(1, 20, { to: '2026-07-31' })

    expect(order).toHaveBeenCalledWith('date', { ascending: false })
    expect(gte).not.toHaveBeenCalled()
    expect(lte).toHaveBeenCalledWith('date', '2026-07-31')
    expect(range).toHaveBeenCalledWith(0, 19)
  })
})
