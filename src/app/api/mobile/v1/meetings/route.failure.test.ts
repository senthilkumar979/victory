import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const { authenticateMobileRequestMock, listMeetingsMock } = vi.hoisted(() => ({
  authenticateMobileRequestMock: vi.fn(),
  listMeetingsMock: vi.fn(),
}))

vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileRequest: authenticateMobileRequestMock,
}))

vi.mock('@/lib/mobile/meetingService', () => ({
  listMeetings: listMeetingsMock,
}))

import { GET } from './route'
import { MobileServiceError } from '@/lib/mobile/mobileApiUtils'

describe('GET /api/mobile/v1/meetings failures', () => {
  beforeEach(() => {
    authenticateMobileRequestMock.mockReset()
    listMeetingsMock.mockReset()
    authenticateMobileRequestMock.mockResolvedValue({
      user: { id: 'student-1' },
      email: 'student@example.com',
      userId: 'student-1',
    })
  })

  it('passes omitted date filters through as undefined', async () => {
    listMeetingsMock.mockResolvedValue({ data: [], pagination: { page: 1 } })

    const response = await GET(
      new Request('http://localhost/api/mobile/v1/meetings'),
    )

    expect(response.status).toBe(200)
    expect(listMeetingsMock).toHaveBeenCalledWith(1, 20, {
      from: undefined,
      to: undefined,
    })
  })

  it('forwards blank date filters so the service can ignore them', async () => {
    listMeetingsMock.mockResolvedValue({ data: [], pagination: { page: 1 } })

    await GET(
      new Request('http://localhost/api/mobile/v1/meetings?from=&to='),
    )

    expect(listMeetingsMock).toHaveBeenCalledWith(1, 20, {
      from: '',
      to: '',
    })
  })

  it('returns the meeting service status and code', async () => {
    listMeetingsMock.mockRejectedValue(
      new MobileServiceError('Could not load meetings.', 500, 'INTERNAL_ERROR'),
    )

    const response = await GET(
      new Request('http://localhost/api/mobile/v1/meetings'),
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Could not load meetings.',
      code: 'INTERNAL_ERROR',
      details: {},
    })
  })

  it('hides unexpected failures behind a generic 500', async () => {
    listMeetingsMock.mockRejectedValue(new Error('relation missing'))
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const response = await GET(
      new Request('http://localhost/api/mobile/v1/meetings'),
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    })
    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })
})
