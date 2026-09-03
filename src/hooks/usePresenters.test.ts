import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { PresenterFormState } from '@/app/modules/Presenters/Presenter.types'

import { usePresenters } from './usePresenters'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

function createListQuery(result: { data: unknown; error: unknown }) {
  const query = {
    select: vi.fn(),
    order: vi.fn(),
    then(onFulfilled: (value: { data: unknown; error: unknown }) => unknown) {
      return Promise.resolve(result).then(onFulfilled)
    },
  }
  query.select.mockReturnValue(query)
  query.order.mockReturnValue(query)
  return query
}

function createStudentsQuery(result: { data: unknown }) {
  const query = {
    select: vi.fn(),
    in: vi.fn().mockResolvedValue(result),
  }
  query.select.mockReturnValue(query)
  return query
}

function createInsertQuery(result: { data: unknown; error: unknown }) {
  const query = {
    insert: vi.fn(),
    select: vi.fn(),
    single: vi.fn().mockResolvedValue(result),
  }
  query.insert.mockReturnValue(query)
  query.select.mockReturnValue(query)
  return query
}

const presenterRows = [
  {
    id: 'p1',
    presented_by: 'ada@example.com',
    presented_date: '2026-03-01',
    topic: 'Compilers',
  },
  {
    id: 'p2',
    presented_by: 'ada@example.com',
    presented_date: null,
    topic: null,
  },
  { id: 'p3', presented_by: '', presented_date: '2025-01-01', topic: 'Empty' },
  {
    id: 'p4',
    presented_by: 'unknown@example.com',
    presented_date: '2024-06-01',
    topic: 'Guest',
  },
]

const newPresenter: Omit<PresenterFormState, 'id'> = {
  presentedBy: 'ada@example.com',
  presentedDate: '2026-04-01',
  topic: 'Types',
}

afterEach(() => {
  cleanup()
})

describe('usePresenters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('enriches unique presenter emails and leaves unmatched rows without a student', async () => {
    const listQuery = createListQuery({ data: presenterRows, error: null })
    const studentsQuery = createStudentsQuery({
      data: [
        {
          email: 'ada@example.com',
          name: 'Ada',
          picture: null,
          batch: '12',
        },
      ],
    })
    fromMock.mockImplementation((table: string) => {
      if (table === 'presenters') return listQuery
      return studentsQuery
    })

    const { result } = renderHook(() => usePresenters())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(listQuery.select).toHaveBeenCalledWith(
      'id, presented_by, presented_date, topic',
    )
    expect(listQuery.order).toHaveBeenCalledWith('presented_date', {
      ascending: false,
    })
    expect(studentsQuery.in).toHaveBeenCalledWith('email', [
      'ada@example.com',
      'unknown@example.com',
    ])
    expect(result.current.presenters).toEqual([
      expect.objectContaining({
        id: 'p1',
        presentedBy: 'ada@example.com',
        student: { name: 'Ada', picture: '', batch: '12' },
      }),
      expect.objectContaining({
        id: 'p2',
        presentedDate: '',
        topic: '',
        student: { name: 'Ada', picture: '', batch: '12' },
      }),
      expect.objectContaining({ id: 'p3', presentedBy: '', student: undefined }),
      expect.objectContaining({
        id: 'p4',
        presentedBy: 'unknown@example.com',
        student: undefined,
      }),
    ])
  })

  it('skips the student lookup when there are no presenter rows', async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === 'presenters')
        return createListQuery({ data: [], error: null })
      throw new Error(`unexpected table ${table}`)
    })

    const { result } = renderHook(() => usePresenters())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.presenters).toEqual([])
    expect(fromMock).toHaveBeenCalledTimes(1)
  })

  it('throws when create returns no id', async () => {
    const listQuery = createListQuery({ data: [], error: null })
    const insertQuery = createInsertQuery({ data: {}, error: null })
    fromMock.mockReturnValueOnce(listQuery).mockReturnValueOnce(insertQuery)

    const { result } = renderHook(() => usePresenters())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await expect(result.current.createPresenter(newPresenter)).rejects.toThrow(
      'Presenter created but no id returned',
    )
    expect(insertQuery.insert).toHaveBeenCalledWith({
      presented_by: 'ada@example.com',
      presented_date: '2026-04-01',
      topic: 'Types',
    })
  })

  it('surfaces a Postgrest-style fetch error as the generic fallback', async () => {
    fromMock.mockReturnValue(
      createListQuery({ data: null, error: { message: 'timeout' } }),
    )

    const { result } = renderHook(() => usePresenters())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Failed to fetch presenters')
    expect(result.current.presenters).toEqual([])
  })
})
