import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useMemberDashboardStudent } from './useMemberDashboardStudent'

const { fromMock, useUserMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
  useUserMock: vi.fn(),
}))

vi.mock('@clerk/nextjs', () => ({
  useUser: useUserMock,
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

interface StudentQuery {
  select: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  maybeSingle: ReturnType<typeof vi.fn>
}

function mockStudentQuery(result: unknown): StudentQuery {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
  query.select.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  fromMock.mockReturnValue(query)
  return query
}

function mockUser(email: string | null): void {
  useUserMock.mockReturnValue({
    user: email
      ? {
          primaryEmailAddressId: 'email-1',
          emailAddresses: [{ id: 'email-1', emailAddress: email }],
        }
      : null,
  })
}

describe('useMemberDashboardStudent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser(null)
  })

  it('does not query Supabase when the signed-in user has no email', async () => {
    const { result } = renderHook(() => useMemberDashboardStudent())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fromMock).not.toHaveBeenCalled()
    expect(result.current.profile).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('queries by primary email and maps a complete student profile', async () => {
    mockUser('student@example.com')
    const query = mockStudentQuery({
      data: {
        id: 'student-1',
        name: 'Ada Lovelace',
        email: 'student@example.com',
        picture: 'avatar.png',
        role: 'Engineer',
        batch: 'Batch 1',
        serial_no: 17,
        skill_sets: '["TypeScript"]',
        social_links: '{"linkedIn":"https://linkedin.com/in/ada","gitHub":""}',
      },
      error: null,
    })

    const { result } = renderHook(() => useMemberDashboardStudent())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fromMock).toHaveBeenCalledWith('students')
    expect(query.select).toHaveBeenCalledWith('*')
    expect(query.eq).toHaveBeenCalledWith('email', 'student@example.com')
    expect(query.maybeSingle).toHaveBeenCalledTimes(1)
    expect(result.current.profile).toEqual(
      expect.objectContaining({
        name: 'Ada Lovelace',
        email: 'student@example.com',
        serialNo: 17,
        skillSets: ['TypeScript'],
      }),
    )
  })

  it('keeps the profile empty when the matching row is missing a name', async () => {
    mockUser('student@example.com')
    mockStudentQuery({
      data: { id: 'student-1', email: 'student@example.com' },
      error: null,
    })

    const { result } = renderHook(() => useMemberDashboardStudent())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.profile).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('surfaces Supabase errors and clears profile data', async () => {
    mockUser('student@example.com')
    mockStudentQuery({
      data: null,
      error: new Error('Supabase unavailable'),
    })

    const { result } = renderHook(() => useMemberDashboardStudent())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.profile).toBeNull()
    expect(result.current.error).toBe('Supabase unavailable')
  })
})
