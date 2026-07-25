import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getMobileDbMock, paginationMetaMock } = vi.hoisted(() => ({
  getMobileDbMock: vi.fn(),
  paginationMetaMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/mobile/mobileApiUtils', () => ({
  getMobileDb: getMobileDbMock,
  MobileServiceError: class MobileServiceError extends Error {
    constructor(
      message: string,
      public status: number,
      public code: string,
    ) {
      super(message)
      this.name = 'MobileServiceError'
    }
  },
  paginationMeta: paginationMetaMock,
}))

import {
  deleteTableRow,
  insertTableRow,
  listTableRows,
  updateTableRow,
} from '@/lib/mobile/adminCrudService'
import { MobileServiceError } from '@/lib/mobile/mobileApiUtils'

function createListDb(result: {
  data: Record<string, unknown>[] | null
  error: { message: string } | null
  count: number | null
}) {
  const range = vi.fn().mockResolvedValue(result)
  const order = vi.fn().mockReturnValue({ range })
  const select = vi.fn().mockReturnValue({ order })
  const from = vi.fn().mockReturnValue({ select })
  return { db: { from }, from, select, order, range }
}

function createMutationDb(result: {
  data: Record<string, unknown> | null
  error: { message: string } | null
}) {
  const maybeSingle = vi.fn().mockResolvedValue(result)
  const single = vi.fn().mockResolvedValue(result)
  const select = vi.fn().mockReturnValue({ single, maybeSingle })
  const eq = vi.fn().mockReturnValue({ select })
  const insert = vi.fn().mockReturnValue({ select })
  const update = vi.fn().mockReturnValue({ eq })
  const del = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue(result) })
  const from = vi.fn().mockReturnValue({ insert, update, delete: del })
  return { db: { from }, from, insert, update, delete: del, eq, select, single, maybeSingle }
}

describe('adminCrudService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    paginationMetaMock.mockImplementation((page, limit, totalCount) => ({
      page,
      limit,
      totalCount,
    }))
  })

  it('lists rows with page range, default ordering, and pagination metadata', async () => {
    const { db, from, select, order, range } = createListDb({
      data: [{ id: 'partner-1' }],
      error: null,
      count: 41,
    })
    getMobileDbMock.mockReturnValue(db)

    const result = await listTableRows('partners', 'id,name', 3, 10)

    expect(from).toHaveBeenCalledWith('partners')
    expect(select).toHaveBeenCalledWith('id,name', { count: 'exact' })
    expect(order).toHaveBeenCalledWith('id', { ascending: false })
    expect(range).toHaveBeenCalledWith(20, 29)
    expect(paginationMetaMock).toHaveBeenCalledWith(3, 10, 41)
    expect(result).toEqual({
      data: [{ id: 'partner-1' }],
      pagination: { page: 3, limit: 10, totalCount: 41 },
    })
  })

  it('falls back to the row length when count is missing', async () => {
    const { db } = createListDb({
      data: [{ id: 'a' }, { id: 'b' }],
      error: null,
      count: null,
    })
    getMobileDbMock.mockReturnValue(db)

    await listTableRows('awards')

    expect(paginationMetaMock).toHaveBeenCalledWith(1, 50, 2)
  })

  it('converts list database failures into MobileServiceError', async () => {
    const { db } = createListDb({
      data: null,
      error: { message: 'boom' },
      count: null,
    })
    getMobileDbMock.mockReturnValue(db)

    await expect(listTableRows('presenters')).rejects.toMatchObject({
      name: 'MobileServiceError',
      message: 'Could not load presenters.',
      status: 500,
      code: 'INTERNAL_ERROR',
    })
  })

  it('inserts a row and returns the created record', async () => {
    const created = { id: 'award-1', title: 'Star' }
    const { db, from, insert } = createMutationDb({ data: created, error: null })
    getMobileDbMock.mockReturnValue(db)

    await expect(insertTableRow('awards', { title: 'Star' })).resolves.toEqual(
      created,
    )
    expect(from).toHaveBeenCalledWith('awards')
    expect(insert).toHaveBeenCalledWith({ title: 'Star' })
  })

  it('throws NOT_FOUND when an update matches no row', async () => {
    const { db } = createMutationDb({ data: null, error: null })
    getMobileDbMock.mockReturnValue(db)

    try {
      await updateTableRow('partners', 'missing', { name: 'Updated' })
      expect.unreachable('updateTableRow should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(MobileServiceError)
      expect(error).toMatchObject({
        message: 'Not found',
        status: 404,
        code: 'NOT_FOUND',
      })
    }
  })

  it('deletes by id and surfaces delete failures', async () => {
    const deleteEq = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'denied' },
    })
    const from = vi.fn().mockReturnValue({
      delete: vi.fn().mockReturnValue({ eq: deleteEq }),
    })
    getMobileDbMock.mockReturnValue({ from })

    await expect(deleteTableRow('google_groups', 'group-1')).rejects.toMatchObject(
      {
        name: 'MobileServiceError',
        message: 'Could not delete google_groups row.',
        status: 500,
        code: 'INTERNAL_ERROR',
      },
    )
    expect(deleteEq).toHaveBeenCalledWith('id', 'group-1')
  })
})
