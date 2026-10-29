import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { isTransientFetchFailure } from '@/lib/supabase/clientQueryError'

import { useUpdateStudent, type ProfileUpdatePayload } from './useUpdateStudent'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

const payload: ProfileUpdatePayload = {
  name: 'Ada Lovelace',
  role: 'Mentor',
  email: 'ada@example.test',
  cohortId: 'cohort-1',
}

function mockUpdate(result: unknown): void {
  const query = {
    update: vi.fn(),
    eq: vi.fn(),
    select: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
  query.update.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  query.select.mockReturnValue(query)
  fromMock.mockReturnValue(query)
}

describe('useUpdateStudent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('throws a transient fetch failure as an Error instead of a plain object', async () => {
    mockUpdate({
      data: null,
      error: {
        code: '',
        details: 'TypeError: Failed to fetch\n    at chunk.js:1:1',
        hint: '',
        message: 'TypeError: Failed to fetch (db.example.test)',
      },
    })

    const { result } = renderHook(() => useUpdateStudent())

    await expect(result.current.updateStudent('student-1', payload)).rejects.toMatchObject({
      name: 'SupabaseRequestError',
      message: 'TypeError: Failed to fetch (db.example.test)',
    })

    try {
      await result.current.updateStudent('student-1', payload)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect(isTransientFetchFailure(error)).toBe(true)
    }
  })

  it('throws database errors as Errors that stay reportable', async () => {
    mockUpdate({
      data: null,
      error: {
        code: '42501',
        details: '',
        hint: '',
        message: 'permission denied for table students',
      },
    })

    const { result } = renderHook(() => useUpdateStudent())

    await expect(result.current.updateStudent('student-1', payload)).rejects.toThrow(
      'permission denied for table students',
    )
  })
})
