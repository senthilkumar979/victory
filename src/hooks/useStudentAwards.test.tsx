import { cleanup, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AppContext } from '../app/contexts/AppContext'
import { useStudentAwards } from './useStudentAwards'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

const dispatch = vi.fn()

function wrapper({ children }: { children: ReactNode }) {
  return (
    <AppContext.Provider
      value={{ repositories: [], blogs: [], awards: [], dispatch }}
    >
      {children}
    </AppContext.Provider>
  )
}

function createAwardsQuery(result: { data: unknown; error: unknown }) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn().mockResolvedValue(result),
  }
  query.select.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  return query
}

function createCategoriesQuery(result: { data: unknown }) {
  const query = {
    select: vi.fn(),
    in: vi.fn().mockResolvedValue(result),
  }
  query.select.mockReturnValue(query)
  return query
}

afterEach(() => {
  cleanup()
})

describe('useStudentAwards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it.each([undefined, null, '', '   '])(
    'does not query awards when studentEmail is %j',
    async (email) => {
      const { result } = renderHook(() => useStudentAwards(email), { wrapper })

      await waitFor(() => expect(result.current.loading).toBe(false))

      expect(fromMock).not.toHaveBeenCalled()
      expect(result.current.awards).toEqual([])
      expect(result.current.error).toBeNull()
      expect(dispatch).not.toHaveBeenCalled()
    },
  )

  it('maps missing columns, skips empty category ids, and enriches known categories', async () => {
    const awardsQuery = createAwardsQuery({
      data: [
        {
          id: 'aw1',
          awarded_to: 'ada@example.com',
          awarded_on: '2026-03-01',
          description: 'Outstanding',
          award_category_id: 'cat-1',
        },
        {
          id: 'aw2',
        },
        {
          id: 'aw3',
          awarded_to: 'ada@example.com',
          award_category_id: 'missing-cat',
        },
      ],
      error: null,
    })
    const categoriesQuery = createCategoriesQuery({
      data: [{ id: 'cat-1', name: 'Leadership' }],
    })
    fromMock.mockImplementation((table: string) => {
      if (table === 'awards') return awardsQuery
      return categoriesQuery
    })

    const { result } = renderHook(() => useStudentAwards('ada@example.com'), {
      wrapper,
    })
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(awardsQuery.eq).toHaveBeenCalledWith('awarded_to', 'ada@example.com')
    expect(categoriesQuery.in).toHaveBeenCalledWith('id', [
      'cat-1',
      'missing-cat',
    ])
    expect(result.current.awards).toEqual([
      expect.objectContaining({
        id: 'aw1',
        awardedTo: 'ada@example.com',
        categoryName: 'Leadership',
      }),
      {
        id: 'aw2',
        awardedTo: '',
        awardedOn: '',
        description: '',
        awardCategoryId: '',
        categoryName: undefined,
      },
      expect.objectContaining({
        id: 'aw3',
        awardCategoryId: 'missing-cat',
        categoryName: undefined,
      }),
    ])
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_AWARDS',
      payload: result.current.awards,
    })
  })

  it('does not query categories when every award lacks a category id', async () => {
    const awardsQuery = createAwardsQuery({
      data: [
        {
          id: 'aw1',
          awarded_to: 'ada@example.com',
          awarded_on: '2026-01-01',
          description: 'Note',
          award_category_id: '',
        },
      ],
      error: null,
    })
    fromMock.mockImplementation((table: string) => {
      if (table === 'awards') return awardsQuery
      throw new Error(`unexpected table ${table}`)
    })

    const { result } = renderHook(() => useStudentAwards('ada@example.com'), {
      wrapper,
    })
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(fromMock).toHaveBeenCalledTimes(1)
    expect(result.current.awards[0]?.categoryName).toBeUndefined()
  })

  it('surfaces a Postgrest-style fetch error as the generic fallback', async () => {
    fromMock.mockReturnValue(
      createAwardsQuery({ data: null, error: { message: 'timeout' } }),
    )

    const { result } = renderHook(() => useStudentAwards('ada@example.com'), {
      wrapper,
    })
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Failed to fetch awards')
    expect(result.current.awards).toEqual([])
    expect(dispatch).not.toHaveBeenCalled()
  })
})
