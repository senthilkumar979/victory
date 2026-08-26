import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const {
  authenticateMobileAdminMock,
  listAnnouncementsMock,
  createAnnouncementMock,
} = vi.hoisted(() => ({
  authenticateMobileAdminMock: vi.fn(),
  listAnnouncementsMock: vi.fn(),
  createAnnouncementMock: vi.fn(),
}))

vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileAdmin: authenticateMobileAdminMock,
}))

vi.mock('@/lib/mobile/announcementService', () => ({
  listAnnouncements: listAnnouncementsMock,
  createAnnouncement: createAnnouncementMock,
}))

import { GET, POST } from './route'

const announcement = {
  id: 'ann-1',
  title: 'Office hours',
  description: 'Bring questions',
}

function jsonRequest(url: string, method: string, body?: unknown) {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

describe('admin announcements collection', () => {
  beforeEach(() => {
    authenticateMobileAdminMock.mockReset()
    listAnnouncementsMock.mockReset()
    createAnnouncementMock.mockReset()
    authenticateMobileAdminMock.mockResolvedValue({
      user: { id: 'admin-1' },
      email: 'admin@example.com',
      userId: 'admin-1',
    })
  })

  it('GET requires an admin session', async () => {
    const forbidden = Response.json(
      { error: 'Forbidden', code: 'FORBIDDEN' },
      { status: 403 },
    )
    authenticateMobileAdminMock.mockResolvedValue({ error: forbidden })

    const response = await GET(
      new Request('http://localhost/api/mobile/v1/admin/announcements'),
    )

    expect(response).toBe(forbidden)
    expect(listAnnouncementsMock).not.toHaveBeenCalled()
  })

  it('POST rejects missing or whitespace-only title and description', async () => {
    const missing = await POST(
      jsonRequest('http://localhost/api/mobile/v1/admin/announcements', 'POST', {
        title: '  ',
        description: 'Body',
      }),
    )
    expect(missing.status).toBe(400)
    await expect(missing.json()).resolves.toEqual({
      error: 'title and description are required',
      code: 'VALIDATION_ERROR',
    })
    expect(createAnnouncementMock).not.toHaveBeenCalled()

    const noDescription = await POST(
      jsonRequest('http://localhost/api/mobile/v1/admin/announcements', 'POST', {
        title: 'Office hours',
      }),
    )
    expect(noDescription.status).toBe(400)
    expect(createAnnouncementMock).not.toHaveBeenCalled()
  })

  it('POST creates an announcement for admins', async () => {
    createAnnouncementMock.mockResolvedValue(announcement)

    const response = await POST(
      jsonRequest('http://localhost/api/mobile/v1/admin/announcements', 'POST', {
        title: 'Office hours',
        description: 'Bring questions',
      }),
    )

    expect(createAnnouncementMock).toHaveBeenCalledWith({
      title: 'Office hours',
      description: 'Bring questions',
    })
    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({ data: announcement })
  })
})
