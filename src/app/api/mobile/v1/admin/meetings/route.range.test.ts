import { NextResponse } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { authenticateMobileAdminMock, listMeetingsMock, createMeetingMock } =
  vi.hoisted(() => ({
    authenticateMobileAdminMock: vi.fn(),
    listMeetingsMock: vi.fn(),
    createMeetingMock: vi.fn(),
  }))

vi.mock('server-only', () => ({}))
vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileAdmin: authenticateMobileAdminMock,
}))
vi.mock('@/lib/mobile/meetingService', () => ({
  listMeetings: listMeetingsMock,
  createMeeting: createMeetingMock,
}))

import { GET, POST } from './route'

describe('admin meetings route range', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticateMobileAdminMock.mockResolvedValue({
      user: { id: 'admin-1' },
      email: 'admin@example.com',
      userId: 'admin-1',
    })
    listMeetingsMock.mockResolvedValue({ data: [], pagination: { page: 1 } })
  })

  it('forwards page, limit, and date bounds to the meeting list', async () => {
    const response = await GET(
      new Request(
        'http://localhost/api/mobile/v1/admin/meetings?page=2&limit=5&from=2026-04-01&to=2026-04-30',
      ),
    )

    expect(response.status).toBe(200)
    expect(listMeetingsMock).toHaveBeenCalledWith(2, 5, {
      from: '2026-04-01',
      to: '2026-04-30',
    })
  })

  it('passes empty date params through instead of dropping them', async () => {
    await GET(
      new Request('http://localhost/api/mobile/v1/admin/meetings?from=&to='),
    )

    expect(listMeetingsMock).toHaveBeenCalledWith(1, 20, { from: '', to: '' })
  })

  it('returns the auth response without listing meetings', async () => {
    authenticateMobileAdminMock.mockResolvedValue({
      error: NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN' },
        { status: 403 },
      ),
    })

    const response = await GET(
      new Request('http://localhost/api/mobile/v1/admin/meetings'),
    )

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({
      error: 'Forbidden',
      code: 'FORBIDDEN',
    })
    expect(listMeetingsMock).not.toHaveBeenCalled()
  })

  it('rejects a whitespace title before creating a meeting', async () => {
    const response = await POST(
      new Request('http://localhost/api/mobile/v1/admin/meetings', {
        method: 'POST',
        body: JSON.stringify({ title: '   ', date: '2026-04-02' }),
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'title and date are required',
      code: 'VALIDATION_ERROR',
    })
    expect(createMeetingMock).not.toHaveBeenCalled()
  })
})
