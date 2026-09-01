import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useStudents } from './useStudents'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

interface QueryMocks {
  select: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  then: (
    onFulfilled: (value: { data: unknown; error: unknown }) => unknown,
  ) => Promise<unknown>
}

function createQuery(result: { data: unknown; error: unknown }): QueryMocks {
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

afterEach(() => {
  cleanup()
})

describe('useStudents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  it('parses social_links from JSON, objects, and invalid values', async () => {
    const query = createQuery({
      data: [
        {
          id: 's1',
          name: 'Ada',
          picture: 'ada.png',
          role: 'Engineer',
          company: 'Acme',
          email: 'ada@example.com',
          social_links: '{"linkedIn":"https://linkedin.com/in/ada"}',
          batch: '12',
        },
        {
          id: 's2',
          name: 'Grace',
          picture: 'grace.png',
          role: 'Lead',
          company: 'Acme',
          email: 'grace@example.com',
          social_links: { gitHub: 'https://github.com/grace' },
          batch: '11',
        },
        {
          id: 's3',
          name: 'Alan',
          picture: null,
          role: null,
          company: null,
          email: 'alan@example.com',
          social_links: 'not-json',
          batch: '10',
        },
        {
          id: 's4',
          name: 'Ken',
          picture: null,
          role: null,
          company: null,
          email: 'ken@example.com',
          social_links: '',
          batch: '9',
        },
      ],
      error: null,
    })
    fromMock.mockReturnValue(query)

    const { result } = renderHook(() => useStudents())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(query.select).toHaveBeenCalledWith(
      'id, name, picture, role, company, email, social_links, batch',
    )
    expect(query.order).toHaveBeenNthCalledWith(1, 'batch', { ascending: false })
    expect(query.order).toHaveBeenNthCalledWith(2, 'name', { ascending: true })
    expect(result.current.students.map((student) => student.socialLinks)).toEqual([
      { linkedIn: 'https://linkedin.com/in/ada' },
      { gitHub: 'https://github.com/grace' },
      {},
      {},
    ])
  })

  it('keeps the list empty when data is null and maps Postgrest errors to a fallback', async () => {
    fromMock.mockReturnValue(createQuery({ data: null, error: null }))

    const { result, rerender } = renderHook(() => useStudents())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.students).toEqual([])

    fromMock.mockReturnValue(
      createQuery({ data: null, error: { message: 'timeout' } }),
    )
    rerender()
    await act(async () => {
      await result.current.refetch()
    })
    expect(result.current.error).toBe('Failed to fetch students')
    expect(result.current.students).toEqual([])
  })
})
