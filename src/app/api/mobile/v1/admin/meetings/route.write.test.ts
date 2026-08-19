import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  authenticateMobileAdmin: vi.fn(),
  createMeeting: vi.fn(),
  listMeetings: vi.fn(),
}))

vi.mock('server-only', () => ({}))
vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileAdmin: mocks.authenticateMobileAdmin,
}))
vi.mock('@/lib/mobile/meetingService', () => ({
  createMeeting: mocks.createMeeting,
  listMeetings: mocks.listMeetings,
}))

import { POST } from '@/app/api/mobile/v1/admin/meetings/route'
import { MobileServiceError } from '@/lib/mobile/mobileApiUtils'

const createdMeeting = {
  id: 'meeting-1',
  title: 'Weekly sync',
  date: '2026-07-19T00:00:00+05:30',
  googleGroupId: 'group-1',
  description: 'Agenda',
  meetingLink: '',
  coverImageUrl: '',
}

function makeJsonRequest(body: unknown) {
  return new Request('http://localhost/api/mobile/v1/admin/meetings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/mobile/v1/admin/meetings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.authenticateMobileAdmin.mockResolvedValue({
      user: { id: 'admin-1' },
      email: 'admin@example.com',
      userId: 'admin-1',
    })
    mocks.createMeeting.mockResolvedValue(createdMeeting)
  })

  it('short-circuits when admin authentication fails', async () => {
    const unauthorized = Response.json({ error: 'Unauthorized' }, { status: 401 })
    mocks.authenticateMobileAdmin.mockResolvedValue({ error: unauthorized })

    const response = await POST(
      makeJsonRequest({ title: 'Weekly sync', date: '2026-07-19' }),
    )

    expect(response).toBe(unauthorized)
    expect(mocks.createMeeting).not.toHaveBeenCalled()
  })

  it('rejects missing or whitespace-only title and date', async () => {
    const missing = await POST(makeJsonRequest({ title: '  ', date: '' }))
    expect(missing.status).toBe(400)
    await expect(missing.json()).resolves.toEqual({
      error: 'title and date are required',
      code: 'VALIDATION_ERROR',
    })
    expect(mocks.createMeeting).not.toHaveBeenCalled()
  })

  it('creates with defaulted optional fields', async () => {
    const response = await POST(
      makeJsonRequest({
        title: 'Weekly sync',
        date: '2026-07-19',
        feedbackForm: 'https://forms.example.com/1',
      }),
    )

    expect(mocks.createMeeting).toHaveBeenCalledWith({
      title: 'Weekly sync',
      date: '2026-07-19',
      googleGroupId: '',
      description: '',
      meetingLink: '',
      coverImageUrl: '',
      feedbackForm: 'https://forms.example.com/1',
    })
    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({ data: createdMeeting })
  })

  it('maps service errors through the shared mobile error response', async () => {
    mocks.createMeeting.mockRejectedValueOnce(
      new MobileServiceError('Could not create meeting.', 500, 'INTERNAL_ERROR'),
    )

    const response = await POST(
      makeJsonRequest({ title: 'Weekly sync', date: '2026-07-19' }),
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Could not create meeting.',
      code: 'INTERNAL_ERROR',
      details: {},
    })
  })
})
