import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const {
  authenticateMobileAdminMock,
  listTableRowsMock,
  insertTableRowMock,
  updateTableRowMock,
  deleteTableRowMock,
} = vi.hoisted(() => ({
  authenticateMobileAdminMock: vi.fn(),
  listTableRowsMock: vi.fn(),
  insertTableRowMock: vi.fn(),
  updateTableRowMock: vi.fn(),
  deleteTableRowMock: vi.fn(),
}))

vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileAdmin: authenticateMobileAdminMock,
}))

vi.mock('@/lib/mobile/adminCrudService', () => ({
  listTableRows: listTableRowsMock,
  insertTableRow: insertTableRowMock,
  updateTableRow: updateTableRowMock,
  deleteTableRow: deleteTableRowMock,
}))

import { MobileServiceError } from './mobileApiUtils'
import {
  createAdminCrudHandlers,
  createAdminCrudIdHandlers,
} from './createAdminCrudHandlers'

describe('createAdminCrudHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticateMobileAdminMock.mockResolvedValue({
      user: { id: 'admin-1' },
      email: 'admin@example.com',
      userId: 'admin-1',
    })
  })

  it('does not list rows when admin auth fails', async () => {
    const forbidden = Response.json(
      { error: 'Forbidden', code: 'FORBIDDEN' },
      { status: 403 },
    )
    authenticateMobileAdminMock.mockResolvedValue({ error: forbidden })
    const { GET } = createAdminCrudHandlers('presenters')

    const response = await GET(
      new Request('http://localhost/api/mobile/v1/admin/presenters'),
    )

    expect(response).toBe(forbidden)
    expect(listTableRowsMock).not.toHaveBeenCalled()
  })

  it('forwards clamped pagination to listTableRows', async () => {
    listTableRowsMock.mockResolvedValue({
      data: [{ id: 'p1' }],
      pagination: { page: 2, limit: 10 },
    })
    const { GET } = createAdminCrudHandlers('presenters')

    const response = await GET(
      new Request(
        'http://localhost/api/mobile/v1/admin/presenters?page=2&limit=10',
      ),
    )

    expect(listTableRowsMock).toHaveBeenCalledWith('presenters', '*', 2, 10)
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      data: [{ id: 'p1' }],
      pagination: { page: 2, limit: 10 },
    })
  })

  it('creates a row with 201 and maps service errors', async () => {
    const { POST } = createAdminCrudHandlers('awards')
    insertTableRowMock.mockResolvedValueOnce({ id: 'award-1', title: 'Star' })

    const created = await POST(
      new Request('http://localhost/api/mobile/v1/admin/awards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Star' }),
      }),
    )
    expect(created.status).toBe(201)
    await expect(created.json()).resolves.toEqual({
      data: { id: 'award-1', title: 'Star' },
    })

    insertTableRowMock.mockRejectedValueOnce(
      new MobileServiceError('Could not create row.', 500, 'INTERNAL_ERROR'),
    )
    const failed = await POST(
      new Request('http://localhost/api/mobile/v1/admin/awards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Star' }),
      }),
    )
    expect(failed.status).toBe(500)
    await expect(failed.json()).resolves.toMatchObject({
      code: 'INTERNAL_ERROR',
    })
  })
})

describe('createAdminCrudIdHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticateMobileAdminMock.mockResolvedValue({
      user: { id: 'admin-1' },
      email: 'admin@example.com',
      userId: 'admin-1',
    })
  })

  it('patches and deletes by route id', async () => {
    updateTableRowMock.mockResolvedValue({ id: 'gg-1', email: 'a@b.com' })
    deleteTableRowMock.mockResolvedValue(undefined)
    const { PATCH, DELETE } = createAdminCrudIdHandlers('google_groups')
    const context = { params: Promise.resolve({ id: 'gg-1' }) }

    const patched = await PATCH(
      new Request('http://localhost/api/mobile/v1/admin/google-groups/gg-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'a@b.com' }),
      }),
      context,
    )
    expect(updateTableRowMock).toHaveBeenCalledWith('google_groups', 'gg-1', {
      email: 'a@b.com',
    })
    expect(patched.status).toBe(200)

    const deleted = await DELETE(
      new Request('http://localhost/api/mobile/v1/admin/google-groups/gg-1', {
        method: 'DELETE',
      }),
      context,
    )
    expect(deleteTableRowMock).toHaveBeenCalledWith('google_groups', 'gg-1')
    await expect(deleted.json()).resolves.toEqual({ success: true })
  })
})
