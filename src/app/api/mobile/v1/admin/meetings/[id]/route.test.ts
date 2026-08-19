import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  authenticateMobileAdmin: vi.fn(),
  deleteMeeting: vi.fn(),
  getMeetingById: vi.fn(),
  updateMeeting: vi.fn(),
}))

vi.mock('server-only', () => ({}))
vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileAdmin: mocks.authenticateMobileAdmin,
}))
vi.mock('@/lib/mobile/meetingService', () => ({
  deleteMeeting: mocks.deleteMeeting,
  getMeetingById: mocks.getMeetingById,
  updateMeeting: mocks.updateMeeting,
}))

import {
  DELETE,
  GET,
  PATCH,
} from '@/app/api/mobile/v1/admin/meetings/[id]/route'
import { MobileServiceError } from '@/lib/mobile/mobileApiUtils'

const meeting = {
  id: 'meeting-1',
  title: 'Weekly sync',
  date: '2026-07-19T00:00:00+05:30',
  googleGroupId: 'group-1',
  description: 'Agenda',
  meetingLink: 'https://meet.example.com/1',
  coverImageUrl: '',
}

const routeContext = {
  params: Promise.resolve({ id: 'meeting-1' }),
}

function makeJsonRequest(method: string, body?: unknown) {
  return new Request('http://localhost/api/mobile/v1/admin/meetings/meeting-1', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

describe('/api/mobile/v1/admin/meetings/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.authenticateMobileAdmin.mockResolvedValue({
      user: { id: 'admin-1' },
      email: 'admin@example.com',
      userId: 'admin-1',
    })
    mocks.getMeetingById.mockResolvedValue(meeting)
    mocks.updateMeeting.mockResolvedValue(meeting)
    mocks.deleteMeeting.mockResolvedValue(undefined)
  })

  it('GET short-circuits on auth failure and otherwise loads by id', async () => {
    const unauthorized = Response.json({ error: 'Unauthorized' }, { status: 401 })
    mocks.authenticateMobileAdmin.mockResolvedValueOnce({ error: unauthorized })

    const blocked = await GET(makeJsonRequest('GET'), routeContext)
    expect(blocked).toBe(unauthorized)
    expect(mocks.getMeetingById).not.toHaveBeenCalled()

    mocks.authenticateMobileAdmin.mockResolvedValue({
      user: { id: 'admin-1' },
      email: 'admin@example.com',
      userId: 'admin-1',
    })
    const response = await GET(makeJsonRequest('GET'), routeContext)
    expect(mocks.getMeetingById).toHaveBeenCalledWith('meeting-1')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ data: meeting })
  })

  it('GET maps NOT_FOUND from the service', async () => {
    mocks.getMeetingById.mockRejectedValueOnce(
      new MobileServiceError('Meeting not found', 404, 'NOT_FOUND'),
    )

    const response = await GET(makeJsonRequest('GET'), routeContext)

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toMatchObject({
      error: 'Meeting not found',
      code: 'NOT_FOUND',
    })
  })

  it('PATCH requires title and date before updating', async () => {
    const response = await PATCH(
      makeJsonRequest('PATCH', { title: '   ', date: '2026-07-19' }),
      routeContext,
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'title and date are required',
      code: 'VALIDATION_ERROR',
    })
    expect(mocks.updateMeeting).not.toHaveBeenCalled()
  })

  it('PATCH forwards the id and defaulted fields', async () => {
    const response = await PATCH(
      makeJsonRequest('PATCH', {
        title: 'Weekly sync',
        date: '2026-07-19',
        googleGroupId: 'group-1',
        description: 'Agenda',
        meetingLink: 'https://meet.example.com/1',
      }),
      routeContext,
    )

    expect(mocks.updateMeeting).toHaveBeenCalledWith('meeting-1', {
      title: 'Weekly sync',
      date: '2026-07-19',
      googleGroupId: 'group-1',
      description: 'Agenda',
      meetingLink: 'https://meet.example.com/1',
      coverImageUrl: '',
      feedbackForm: undefined,
    })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ data: meeting })
  })

  it('DELETE requires admin auth and reports success', async () => {
    const forbidden = Response.json({ error: 'Forbidden' }, { status: 403 })
    mocks.authenticateMobileAdmin.mockResolvedValueOnce({ error: forbidden })

    const blocked = await DELETE(makeJsonRequest('DELETE'), routeContext)
    expect(blocked).toBe(forbidden)
    expect(mocks.deleteMeeting).not.toHaveBeenCalled()

    mocks.authenticateMobileAdmin.mockResolvedValue({
      user: { id: 'admin-1' },
      email: 'admin@example.com',
      userId: 'admin-1',
    })
    const response = await DELETE(makeJsonRequest('DELETE'), routeContext)
    expect(mocks.deleteMeeting).toHaveBeenCalledWith('meeting-1')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ success: true })
  })
})
