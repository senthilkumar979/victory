import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useStudent } from './useStudent'
import {
  STUDENT_ADMIN_EXTRA_SELECT,
  STUDENT_PUBLIC_SELECT,
} from '@/lib/studentSelectColumns'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

interface StudentQuery {
  select: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  single: ReturnType<typeof vi.fn>
}

function mockStudentQuery(result: unknown): StudentQuery {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    single: vi.fn().mockResolvedValue(result),
  }
  query.select.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  fromMock.mockReturnValue(query)
  return query
}

afterEach(() => {
  cleanup()
})

describe('useStudent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('does not query when the student id is empty', async () => {
    const { result } = renderHook(() => useStudent(''))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(fromMock).not.toHaveBeenCalled()
    expect(result.current.student).toBeNull()
    expect(result.current.error).toBe('Student ID is required')
  })

  it('selects public columns and maps JSON / admin-safe profile fields', async () => {
    const query = mockStudentQuery({
      data: {
        id: 's1',
        name: 'Ada',
        email: 'ada@example.com',
        batch: 12,
        skill_sets: '["TypeScript"]',
        social_links: '{"linkedIn":"https://linkedin.com/in/ada"}',
        serial_no: 17,
        self_intro: 'Hello',
      },
      error: null,
    })

    const { result } = renderHook(() => useStudent('s1'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(fromMock).toHaveBeenCalledWith('students')
    expect(query.select).toHaveBeenCalledWith(STUDENT_PUBLIC_SELECT)
    expect(query.eq).toHaveBeenCalledWith('id', 's1')
    expect(result.current.student).toEqual(
      expect.objectContaining({
        name: 'Ada',
        batch: '12',
        skillSets: ['TypeScript'],
        serialNo: 17,
        selfIntro: 'Hello',
      }),
    )
    expect(result.current.error).toBeNull()
  })

  it('includes guardian columns when admin fields are requested', async () => {
    const query = mockStudentQuery({
      data: {
        id: 's1',
        name: 'Ada',
        father_guardian_details: '  Dad  ',
        mother_details: '   ',
      },
      error: null,
    })

    const { result } = renderHook(() =>
      useStudent('s1', { includeAdminFields: true }),
    )

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(query.select).toHaveBeenCalledWith(
      `${STUDENT_PUBLIC_SELECT}${STUDENT_ADMIN_EXTRA_SELECT}`,
    )
    expect(result.current.student?.fatherGuardianDetails).toBe('  Dad  ')
    expect(result.current.student?.motherDetails).toBeUndefined()
  })

  it('treats PGRST116 as a missing student instead of an error', async () => {
    mockStudentQuery({
      data: null,
      error: { code: 'PGRST116', message: 'No rows found' },
    })

    const { result } = renderHook(() => useStudent('missing'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.student).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('surfaces a Postgrest-style fetch error as the generic fallback', async () => {
    mockStudentQuery({
      data: null,
      error: { message: 'timeout' },
    })

    const { result } = renderHook(() => useStudent('s1'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Failed to fetch student')
    expect(result.current.student).toBeNull()
  })
})
