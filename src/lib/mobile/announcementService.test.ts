import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { getMobileDbMock } = vi.hoisted(() => ({
  getMobileDbMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/mobile/mobileApiUtils', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@/lib/mobile/mobileApiUtils')>()

  return { ...original, getMobileDb: getMobileDbMock }
})

import {
  createAnnouncement,
  deleteAnnouncement,
  listAnnouncements,
  updateAnnouncement,
} from '@/lib/mobile/announcementService'
import { MobileServiceError } from '@/lib/mobile/mobileApiUtils'

const announcementRow = {
  id: 'ann-1',
  title: 'Office hours',
  description: 'Join us Friday',
  created_at: '2026-07-24T12:00:00.000Z',
}

describe('announcementService', () => {
  const range = vi.fn()
  const order = vi.fn()
  const select = vi.fn()
  const from = vi.fn()
  const insert = vi.fn()
  const update = vi.fn()
  const del = vi.fn()
  const eq = vi.fn()
  const single = vi.fn()
  const maybeSingle = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.NEXT_PUBLIC_PUSH_BROADCAST_ENDPOINT

    range.mockResolvedValue({
      data: [announcementRow],
      error: null,
      count: 1,
    })
    order.mockReturnValue({ range })
    select.mockReturnValue({ order, single, maybeSingle })
    insert.mockReturnValue({ select })
    update.mockReturnValue({ eq })
    eq.mockReturnValue({ select, error: null })
    del.mockReturnValue({ eq })
    single.mockResolvedValue({ data: announcementRow, error: null })
    maybeSingle.mockResolvedValue({ data: announcementRow, error: null })
    from.mockImplementation(() => ({
      select,
      insert,
      update,
      delete: del,
    }))
    getMobileDbMock.mockReturnValue({ from })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('lists announcements with descending id order and pagination metadata', async () => {
    const result = await listAnnouncements(2, 5)

    expect(from).toHaveBeenCalledWith('announcements')
    expect(select).toHaveBeenCalledWith(
      'id, title, description, created_at',
      { count: 'exact' },
    )
    expect(order).toHaveBeenCalledWith('id', { ascending: false })
    expect(range).toHaveBeenCalledWith(5, 9)
    expect(result).toEqual({
      data: [announcementRow],
      pagination: {
        page: 2,
        limit: 5,
        totalCount: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    })
  })

  it('trims create payloads and does not broadcast when endpoint is unset', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const created = await createAnnouncement({
      title: '  Office hours  ',
      description: '  Join us Friday  ',
    })

    expect(insert).toHaveBeenCalledWith({
      title: 'Office hours',
      description: 'Join us Friday',
    })
    expect(created).toEqual(announcementRow)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('fires a best-effort push broadcast without failing create on broadcast errors', async () => {
    process.env.NEXT_PUBLIC_PUSH_BROADCAST_ENDPOINT =
      'https://push.example.com/broadcast'
    const fetchMock = vi.fn().mockImplementation(() => {
      throw new Error('network down')
    })
    vi.stubGlobal('fetch', fetchMock)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const created = await createAnnouncement({
      title: 'Launch',
      description: 'App is live',
    })

    expect(created).toEqual(announcementRow)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://push.example.com/broadcast',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Launch',
          body: 'A new announcement has been published.',
          url: '/announcements',
        }),
      }),
    )
    expect(consoleError).toHaveBeenCalled()
  })

  it('maps a missing announcement update to NOT_FOUND', async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null })

    await expect(
      updateAnnouncement('missing', {
        title: 'Updated',
        description: 'Body',
      }),
    ).rejects.toEqual(
      expect.objectContaining({
        message: 'Announcement not found',
        status: 404,
        code: 'NOT_FOUND',
      }),
    )
    expect(eq).toHaveBeenCalledWith('id', 'missing')
  })

  it('converts delete database failures into MobileServiceError', async () => {
    eq.mockResolvedValueOnce({ error: { message: 'fk violation' } })
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(deleteAnnouncement('ann-1')).rejects.toBeInstanceOf(
      MobileServiceError,
    )
    await expect(deleteAnnouncement('ann-1')).rejects.toMatchObject({
      message: 'Could not delete announcement.',
      status: 500,
      code: 'INTERNAL_ERROR',
    })
    expect(consoleError).toHaveBeenCalled()
  })
})
