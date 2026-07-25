import { NextResponse } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { authenticateMobileAdmin } from '@/lib/auth/authenticateMobileRequest'
import {
  deleteTableRow,
  insertTableRow,
  listTableRows,
  updateTableRow,
} from '@/lib/mobile/adminCrudService'
import {
  createAdminCrudHandlers,
  createAdminCrudIdHandlers,
} from '@/lib/mobile/createAdminCrudHandlers'
import { MobileServiceError } from '@/lib/mobile/mobileApiUtils'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileAdmin: vi.fn(),
}))
vi.mock('@/lib/mobile/adminCrudService', () => ({
  deleteTableRow: vi.fn(),
  insertTableRow: vi.fn(),
  listTableRows: vi.fn(),
  updateTableRow: vi.fn(),
}))

afterEach(() => {
  vi.clearAllMocks()
})

describe('createAdminCrudHandlers', () => {
  it('short-circuits before database access when admin auth fails', async () => {
    const unauthorized = NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
    vi.mocked(authenticateMobileAdmin).mockResolvedValue({
      error: unauthorized,
    })

    const response = await createAdminCrudHandlers('partners').GET(
      new Request('https://example.com/api/mobile/v1/admin/partners'),
    )

    expect(response).toBe(unauthorized)
    expect(listTableRows).not.toHaveBeenCalled()
  })

  it('passes bounded pagination to the selected table', async () => {
    allowAdmin()
    vi.mocked(listTableRows).mockResolvedValue({
      data: [{ id: 'partner-1' }],
      pagination: { page: 2, limit: 100 },
    } as never)

    const response = await createAdminCrudHandlers('partners').GET(
      new Request(
        'https://example.com/api/mobile/v1/admin/partners?page=2&limit=500',
      ),
    )

    expect(listTableRows).toHaveBeenCalledWith('partners', '*', 2, 100)
    await expect(response.json()).resolves.toMatchObject({
      data: [{ id: 'partner-1' }],
    })
  })

  it('creates a row from the request body with a 201 response', async () => {
    allowAdmin()
    vi.mocked(insertTableRow).mockResolvedValue({ id: 'award-1' } as never)

    const response = await createAdminCrudHandlers('awards').POST(
      new Request('https://example.com/api/mobile/v1/admin/awards', {
        method: 'POST',
        body: JSON.stringify({ title: 'Achievement' }),
      }),
    )

    expect(insertTableRow).toHaveBeenCalledWith('awards', {
      title: 'Achievement',
    })
    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({ data: { id: 'award-1' } })
  })
})

describe('createAdminCrudIdHandlers', () => {
  it('maps service errors from updates to their public API response', async () => {
    allowAdmin()
    vi.mocked(updateTableRow).mockRejectedValue(
      new MobileServiceError('Not found', 404, 'NOT_FOUND'),
    )

    const response = await createAdminCrudIdHandlers('presenters').PATCH(
      new Request('https://example.com/api/mobile/v1/admin/presenters/missing', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated' }),
      }),
      { params: Promise.resolve({ id: 'missing' }) },
    )

    expect(updateTableRow).toHaveBeenCalledWith('presenters', 'missing', {
      name: 'Updated',
    })
    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('deletes the route parameter and confirms success', async () => {
    allowAdmin()

    const response = await createAdminCrudIdHandlers('google_groups').DELETE(
      new Request('https://example.com/api/mobile/v1/admin/google-groups/group-1'),
      { params: Promise.resolve({ id: 'group-1' }) },
    )

    expect(deleteTableRow).toHaveBeenCalledWith('google_groups', 'group-1')
    await expect(response.json()).resolves.toEqual({ success: true })
  })
})

function allowAdmin() {
  vi.mocked(authenticateMobileAdmin).mockResolvedValue({
    user: {},
    email: 'admin@example.com',
    userId: 'user-1',
  } as never)
}
