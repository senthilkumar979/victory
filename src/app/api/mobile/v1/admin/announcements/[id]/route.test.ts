import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const {
  authenticateMobileAdminMock,
  updateAnnouncementMock,
  deleteAnnouncementMock,
} = vi.hoisted(() => ({
  authenticateMobileAdminMock: vi.fn(),
  updateAnnouncementMock: vi.fn(),
  deleteAnnouncementMock: vi.fn(),
}))

vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileAdmin: authenticateMobileAdminMock,
}))

vi.mock('@/lib/mobile/announcementService', () => ({
  updateAnnouncement: updateAnnouncementMock,
  deleteAnnouncement: deleteAnnouncementMock,
}))

import { DELETE, PATCH } from './route'

const routeContext = { params: Promise.resolve({ id: 'ann-1' }) }

function jsonRequest(url: string, method: string, body?: unknown) {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

describe('admin announcements by id', () => {
  beforeEach(() => {
    authenticateMobileAdminMock.mockReset()
    updateAnnouncementMock.mockReset()
    deleteAnnouncementMock.mockReset()
    authenticateMobileAdminMock.mockResolvedValue({
      user: { id: 'admin-1' },
      email: 'admin@example.com',
      userId: 'admin-1',
    })
  })

  it('PATCH rejects whitespace-only fields before writing', async () => {
    const response = await PATCH(
      jsonRequest(
        'http://localhost/api/mobile/v1/admin/announcements/ann-1',
        'PATCH',
        { title: 'Updated', description: '   ' },
      ),
      routeContext,
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      code: 'VALIDATION_ERROR',
    })
    expect(updateAnnouncementMock).not.toHaveBeenCalled()
  })

  it('PATCH updates when both fields are present', async () => {
    updateAnnouncementMock.mockResolvedValue({
      id: 'ann-1',
      title: 'Updated',
      description: 'New body',
    })

    const response = await PATCH(
      jsonRequest(
        'http://localhost/api/mobile/v1/admin/announcements/ann-1',
        'PATCH',
        { title: 'Updated', description: 'New body' },
      ),
      routeContext,
    )

    expect(updateAnnouncementMock).toHaveBeenCalledWith('ann-1', {
      title: 'Updated',
      description: 'New body',
    })
    expect(response.status).toBe(200)
  })

  it('DELETE removes the announcement for admins only', async () => {
    const forbidden = Response.json(
      { error: 'Forbidden', code: 'FORBIDDEN' },
      { status: 403 },
    )
    authenticateMobileAdminMock.mockResolvedValueOnce({ error: forbidden })

    const blocked = await DELETE(
      jsonRequest(
        'http://localhost/api/mobile/v1/admin/announcements/ann-1',
        'DELETE',
      ),
      routeContext,
    )
    expect(blocked).toBe(forbidden)
    expect(deleteAnnouncementMock).not.toHaveBeenCalled()

    authenticateMobileAdminMock.mockResolvedValue({
      user: { id: 'admin-1' },
      email: 'admin@example.com',
      userId: 'admin-1',
    })
    const deleted = await DELETE(
      jsonRequest(
        'http://localhost/api/mobile/v1/admin/announcements/ann-1',
        'DELETE',
      ),
      routeContext,
    )
    expect(deleteAnnouncementMock).toHaveBeenCalledWith('ann-1')
    expect(deleted.status).toBe(200)
    await expect(deleted.json()).resolves.toEqual({ success: true })
  })
})
