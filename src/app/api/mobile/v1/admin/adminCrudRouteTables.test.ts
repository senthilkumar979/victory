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

import { MobileServiceError } from '@/lib/mobile/mobileApiUtils'
import * as awardCategories from './award-categories/route'
import * as awardCategoriesById from './award-categories/[id]/route'
import * as awards from './awards/route'
import * as awardsById from './awards/[id]/route'
import * as googleGroups from './google-groups/route'
import * as googleGroupsById from './google-groups/[id]/route'
import * as hallOfFame from './hall-of-fame/route'
import * as hallOfFameById from './hall-of-fame/[id]/route'
import * as partners from './partners/route'
import * as partnersById from './partners/[id]/route'
import * as presenters from './presenters/route'
import * as presentersById from './presenters/[id]/route'

const resources = [
  { segment: 'award-categories', table: 'award_categories', collection: awardCategories, byId: awardCategoriesById },
  { segment: 'awards', table: 'awards', collection: awards, byId: awardsById },
  { segment: 'google-groups', table: 'google_groups', collection: googleGroups, byId: googleGroupsById },
  { segment: 'hall-of-fame', table: 'hall_of_fame', collection: hallOfFame, byId: hallOfFameById },
  { segment: 'partners', table: 'partners', collection: partners, byId: partnersById },
  { segment: 'presenters', table: 'presenters', collection: presenters, byId: presentersById },
] as const

function adminUrl(segment: string, id?: string): string {
  const path = id
    ? `/api/mobile/v1/admin/${segment}/${id}`
    : `/api/mobile/v1/admin/${segment}`
  return `http://localhost${path}`
}

describe('mobile admin CRUD route tables', () => {
  beforeEach(() => {
    authenticateMobileAdminMock.mockReset()
    listTableRowsMock.mockReset()
    insertTableRowMock.mockReset()
    updateTableRowMock.mockReset()
    deleteTableRowMock.mockReset()
    authenticateMobileAdminMock.mockResolvedValue({ userId: 'admin-1' })
  })

  it.each(resources)(
    '$segment refuses non-admins before reading or deleting $table',
    async ({ segment, collection, byId }) => {
      const forbidden = Response.json(
        { error: 'Forbidden', code: 'FORBIDDEN' },
        { status: 403 },
      )
      authenticateMobileAdminMock.mockResolvedValue({ error: forbidden })

      const list = await collection.GET(new Request(adminUrl(segment)))
      const remove = await byId.DELETE(new Request(adminUrl(segment, 'row-1')), {
        params: Promise.resolve({ id: 'row-1' }),
      })

      expect(list).toBe(forbidden)
      expect(remove).toBe(forbidden)
      expect(listTableRowsMock).not.toHaveBeenCalled()
      expect(deleteTableRowMock).not.toHaveBeenCalled()
    },
  )

  it.each(resources)(
    '$segment reads and writes only $table',
    async ({ segment, table, collection, byId }) => {
      listTableRowsMock.mockResolvedValue({ data: [{ id: 'row-1' }] })
      insertTableRowMock.mockResolvedValue({ id: 'row-2' })
      updateTableRowMock.mockResolvedValue({ id: 'row-1', name: 'Updated' })
      deleteTableRowMock.mockResolvedValue(undefined)

      const listed = await collection.GET(
        new Request(`${adminUrl(segment)}?page=2&limit=10`),
      )
      const created = await collection.POST(
        new Request(adminUrl(segment), {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ name: 'Ada' }),
        }),
      )
      const updated = await byId.PATCH(
        new Request(adminUrl(segment, 'row-1'), {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ name: 'Updated' }),
        }),
        { params: Promise.resolve({ id: 'row-1' }) },
      )
      const removed = await byId.DELETE(new Request(adminUrl(segment, 'row-1')), {
        params: Promise.resolve({ id: 'row-1' }),
      })

      expect(listTableRowsMock).toHaveBeenCalledWith(table, '*', 2, 10)
      expect(insertTableRowMock).toHaveBeenCalledWith(table, { name: 'Ada' })
      expect(updateTableRowMock).toHaveBeenCalledWith(table, 'row-1', { name: 'Updated' })
      expect(deleteTableRowMock).toHaveBeenCalledWith(table, 'row-1')
      expect(listed.status).toBe(200)
      expect(created.status).toBe(201)
      await expect(created.json()).resolves.toEqual({ data: { id: 'row-2' } })
      expect(updated.status).toBe(200)
      await expect(removed.json()).resolves.toEqual({ success: true })
    },
  )

  it('hides internal failures and preserves service errors', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    listTableRowsMock.mockRejectedValueOnce(new Error('relation secret_table does not exist'))

    const generic = await partners.GET(new Request(adminUrl('partners')))

    expect(generic.status).toBe(500)
    await expect(generic.json()).resolves.toEqual({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    })

    listTableRowsMock.mockRejectedValueOnce(
      new MobileServiceError('Could not load partners.', 503, 'SERVICE_UNAVAILABLE'),
    )
    const service = await partners.GET(new Request(adminUrl('partners')))

    expect(service.status).toBe(503)
    await expect(service.json()).resolves.toEqual({
      error: 'Could not load partners.',
      code: 'SERVICE_UNAVAILABLE',
      details: {},
    })
    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it('does not insert a row when the create body is not JSON', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const response = await awards.POST(
      new Request(adminUrl('awards'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{',
      }),
    )

    expect(response.status).toBe(500)
    expect(insertTableRowMock).not.toHaveBeenCalled()
  })
})
