import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

function mockStudentQuery(result: unknown) {
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

function namedStudent(email: string) {
  return {
    data: {
      id: 'student-1',
      name: 'Ada Lovelace',
      email,
    },
    error: null,
  }
}

describe('useMemberDashboardStudent identity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('queries the primary address when it is not the first email on the user', async () => {
    useUserMock.mockReturnValue({
      user: {
        primaryEmailAddressId: 'email-primary',
        emailAddresses: [
          { id: 'email-old', emailAddress: 'old@example.com' },
          { id: 'email-primary', emailAddress: 'primary@example.com' },
        ],
      },
    })
    const query = mockStudentQuery(namedStudent('primary@example.com'))

    const { result } = renderHook(() => useMemberDashboardStudent())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(query.eq).toHaveBeenCalledWith('email', 'primary@example.com')
    expect(query.eq).not.toHaveBeenCalledWith('email', 'old@example.com')
    expect(result.current.profile).toEqual(
      expect.objectContaining({ name: 'Ada Lovelace' }),
    )
    expect(result.current.error).toBeNull()
  })

  it('falls back to the first address when the primary id does not match', async () => {
    useUserMock.mockReturnValue({
      user: {
        primaryEmailAddressId: 'missing',
        emailAddresses: [
          { id: 'email-1', emailAddress: 'fallback@example.com' },
          { id: 'email-2', emailAddress: 'second@example.com' },
        ],
      },
    })
    const query = mockStudentQuery(namedStudent('fallback@example.com'))

    const { result } = renderHook(() => useMemberDashboardStudent())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(query.eq).toHaveBeenCalledWith('email', 'fallback@example.com')
    expect(result.current.error).toBeNull()
  })

  it('does not query when the signed-in user has no email addresses', async () => {
    useUserMock.mockReturnValue({
      user: {
        primaryEmailAddressId: 'email-1',
        emailAddresses: [],
      },
    })

    const { result } = renderHook(() => useMemberDashboardStudent())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fromMock).not.toHaveBeenCalled()
    expect(result.current.profile).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('stays empty without an error when no student row exists', async () => {
    useUserMock.mockReturnValue({
      user: {
        primaryEmailAddressId: 'email-1',
        emailAddresses: [{ id: 'email-1', emailAddress: 'student@example.com' }],
      },
    })
    mockStudentQuery({ data: null, error: null })

    const { result } = renderHook(() => useMemberDashboardStudent())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fromMock).toHaveBeenCalledWith('students')
    expect(result.current.profile).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('replaces a non-Error query failure with a generic message', async () => {
    useUserMock.mockReturnValue({
      user: {
        primaryEmailAddressId: 'email-1',
        emailAddresses: [{ id: 'email-1', emailAddress: 'student@example.com' }],
      },
    })
    mockStudentQuery({
      data: null,
      error: { message: 'relation "students" does not exist' },
    })

    const { result } = renderHook(() => useMemberDashboardStudent())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.profile).toBeNull()
    expect(result.current.error).toBe('Failed to load profile')
    expect(result.current.error).not.toContain('relation')
  })
})
