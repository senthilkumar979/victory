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
    email: '  ada@example.com  ',
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

describe('useCreateStudentProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn())
  })

  it('rejects duplicate emails before inserting', async () => {
    const lookup = mockLookup({ data: { id: 'existing' }, error: null })
    fromMock.mockReturnValue(lookup)

    const { result } = renderHook(() => useCreateStudentProfile())

    await expect(
      result.current.createStudentProfile(payload()),
    ).rejects.toThrow('A student with this email already exists.')
    expect(lookup.eq).toHaveBeenCalledWith('email', 'ada@example.com')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('creates the student even when the welcome email fails', async () => {
    const lookup = mockLookup({ data: null, error: null })
    const insert = mockInsert({ data: { id: 'generated-id' }, error: null })
    fromMock.mockReturnValueOnce(lookup).mockReturnValueOnce(insert)
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({ error: 'Resend unavailable' }),
    } as Response)

    const { result } = renderHook(() => useCreateStudentProfile())
    await expect(
      result.current.createStudentProfile(payload()),
    ).resolves.toEqual({ id: 'generated-id' })

    expect(insert.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'generated-id',
        email: 'ada@example.com',
        name: 'Ada Lovelace',
      }),
    )
    expect(fetch).toHaveBeenCalledWith(
      '/api/email/send-with-template',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          to: 'ada@example.com',
          templateId: RESEND_TEMPLATE_IDS.STUDENT_PROFILE_CREATED,
          variables: {
            student_name: 'Ada Lovelace',
            student_email: 'ada@example.com',
          },
        }),
      }),
    )
  })

  it('throws when insert returns no row', async () => {
    fromMock
      .mockReturnValueOnce(mockLookup({ data: null, error: null }))
      .mockReturnValueOnce(mockInsert({ data: null, error: null }))

    const { result } = renderHook(() => useCreateStudentProfile())

    await expect(
      result.current.createStudentProfile(payload()),
    ).rejects.toThrow(/No rows were inserted/)
    expect(fetch).not.toHaveBeenCalled()
  })
})
