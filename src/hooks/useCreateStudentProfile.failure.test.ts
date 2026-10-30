import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { RESEND_TEMPLATE_IDS } from '@/constants/ThirdPartyConstants'

import { useCreateStudentProfile } from './useCreateStudentProfile'
import type { ProfileUpdatePayload } from './useUpdateStudent'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

vi.mock('react-uuid', () => ({
  default: () => 'generated-id',
}))

function payload(): ProfileUpdatePayload {
  return {
    name: 'Ada Lovelace',
    role: 'Engineer',
    email: 'ada@example.com',
    cohortId: 'cohort-1',
  }
}

function mockLookup(result: { data: unknown; error: unknown }) {
  const maybeSingle = vi.fn().mockResolvedValue(result)
  const eq = vi.fn().mockReturnValue({ maybeSingle })
  const select = vi.fn().mockReturnValue({ eq })
  return { select, eq, maybeSingle }
}

function mockInsert(result: { data: unknown; error: unknown }) {
  const maybeSingle = vi.fn().mockResolvedValue(result)
  const select = vi.fn().mockReturnValue({ maybeSingle })
  const insert = vi.fn().mockReturnValue({ select })
  return { insert, select, maybeSingle }
}

describe('useCreateStudentProfile failure paths', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.stubGlobal('fetch', vi.fn())
  })

  it('throws the lookup error and does not insert or email', async () => {
    fromMock.mockReturnValue(
      mockLookup({ data: null, error: new Error('lookup failed') }),
    )
    const { result } = renderHook(() => useCreateStudentProfile())

    await expect(result.current.createStudentProfile(payload())).rejects.toThrow(
      'lookup failed',
    )
    expect(fromMock).toHaveBeenCalledTimes(1)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('throws the insert error and does not send a welcome email', async () => {
    fromMock
      .mockReturnValueOnce(mockLookup({ data: null, error: null }))
      .mockReturnValueOnce(
        mockInsert({ data: null, error: new Error('insert failed') }),
      )
    const { result } = renderHook(() => useCreateStudentProfile())

    await expect(result.current.createStudentProfile(payload())).rejects.toThrow(
      'insert failed',
    )
    expect(fetch).not.toHaveBeenCalled()
  })

  it('still returns the new profile when the welcome email request throws', async () => {
    fromMock
      .mockReturnValueOnce(mockLookup({ data: null, error: null }))
      .mockReturnValueOnce(mockInsert({ data: { id: 'generated-id' }, error: null }))
    vi.mocked(fetch).mockRejectedValue(new Error('network down'))
    const { result } = renderHook(() => useCreateStudentProfile())

    await expect(result.current.createStudentProfile(payload())).resolves.toEqual({
      id: 'generated-id',
    })
    expect(console.error).toHaveBeenCalledWith(
      'Failed to send student profile email',
      expect.any(Error),
    )
  })

  it('still returns the new profile when the email error body is not JSON', async () => {
    fromMock
      .mockReturnValueOnce(mockLookup({ data: null, error: null }))
      .mockReturnValueOnce(mockInsert({ data: { id: 'generated-id' }, error: null }))
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('not json')
      },
    } as Response)
    const { result } = renderHook(() => useCreateStudentProfile())

    await expect(result.current.createStudentProfile(payload())).resolves.toEqual({
      id: 'generated-id',
    })
    expect(console.error).toHaveBeenCalledWith(
      'Failed to send student profile email:',
      500,
      expect.any(Object),
    )
  })

  it('skips the welcome email when the template id is blank', async () => {
    const templateIds = RESEND_TEMPLATE_IDS as { STUDENT_PROFILE_CREATED: string }
    const previous = templateIds.STUDENT_PROFILE_CREATED
    templateIds.STUDENT_PROFILE_CREATED = '   '
    fromMock
      .mockReturnValueOnce(mockLookup({ data: null, error: null }))
      .mockReturnValueOnce(mockInsert({ data: { id: 'generated-id' }, error: null }))
    const { result } = renderHook(() => useCreateStudentProfile())

    try {
      await expect(result.current.createStudentProfile(payload())).resolves.toEqual({
        id: 'generated-id',
      })
      expect(fetch).not.toHaveBeenCalled()
    } finally {
      templateIds.STUDENT_PROFILE_CREATED = previous
    }
  })
})
