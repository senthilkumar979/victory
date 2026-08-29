import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { toSupabasePayload, useUpdateStudent } from './useUpdateStudent'
import type { ProfileUpdatePayload } from './useUpdateStudent'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

function basePayload(
  overrides: Partial<ProfileUpdatePayload> = {},
): ProfileUpdatePayload {
  return {
    name: '  Ada Lovelace  ',
    role: '  Engineer  ',
    email: '  ada@example.com  ',
    cohortId: 'cohort-1',
    ...overrides,
  }
}

describe('toSupabasePayload', () => {
  it('trims scalars and maps only M/F gender values', () => {
    expect(
      toSupabasePayload(
        basePayload({
          picture: '  avatar.png  ',
          company: '  MentorBridge  ',
          summary: '  Hello  ',
          mediumUsername: '  ada  ',
          gender: ' f ',
          resumeLink: '  https://example.com/cv  ',
        }),
      ),
    ).toMatchObject({
      name: 'Ada Lovelace',
      picture: 'avatar.png',
      role: 'Engineer',
      company: 'MentorBridge',
      summary: 'Hello',
      email: 'ada@example.com',
      medium_username: 'ada',
      cohort_id: 'cohort-1',
      gender: 'F',
      resume_link: 'https://example.com/cv',
    })

    expect(toSupabasePayload(basePayload({ gender: 'x' })).gender).toBeNull()
    expect(toSupabasePayload(basePayload({ gender: '  ' })).gender).toBeNull()
    expect(toSupabasePayload(basePayload({ gender: 'm' })).gender).toBe('M')
  })

  it('omits guardian columns unless they are provided', () => {
    const withoutGuardians = toSupabasePayload(basePayload())
    expect(withoutGuardians).not.toHaveProperty('father_guardian_details')
    expect(withoutGuardians).not.toHaveProperty('mother_details')

    expect(
      toSupabasePayload(
        basePayload({
          fatherGuardianDetails: '  Dad  ',
          motherDetails: '   ',
        }),
      ),
    ).toMatchObject({
      father_guardian_details: 'Dad',
      mother_details: null,
    })
  })

  it('trims social links and uses empty strings for missing profiles', () => {
    expect(
      toSupabasePayload(
        basePayload({
          socialLinks: {
            linkedIn: '  https://linkedin.com/in/ada  ',
            gitHub: '',
          },
        }),
      ).social_links,
    ).toEqual({
      linkedIn: 'https://linkedin.com/in/ada',
      gitHub: '',
      website: '',
    })

    expect(toSupabasePayload(basePayload()).social_links).toBeNull()
  })
})

describe('useUpdateStudent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  function mockUpdate(result: { data: unknown; error: unknown }) {
    const maybeSingle = vi.fn().mockResolvedValue(result)
    const select = vi.fn().mockReturnValue({ maybeSingle })
    const eq = vi.fn().mockReturnValue({ select })
    const update = vi.fn().mockReturnValue({ eq })
    fromMock.mockReturnValue({ update })
    return { update, eq, maybeSingle }
  }

  it('updates by id and throws when RLS returns no row', async () => {
    const { update, eq, maybeSingle } = mockUpdate({
      data: null,
      error: null,
    })
    const { result } = renderHook(() => useUpdateStudent())

    await expect(
      result.current.updateStudent('student-1', basePayload()),
    ).rejects.toThrow(/No rows were updated/)

    expect(fromMock).toHaveBeenCalledWith('students')
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'student-1',
        email: 'ada@example.com',
      }),
    )
    expect(eq).toHaveBeenCalledWith('id', 'student-1')
    expect(maybeSingle).toHaveBeenCalledTimes(1)
  })

  it('rethrows Supabase errors', async () => {
    mockUpdate({ data: null, error: new Error('permission denied') })
    const { result } = renderHook(() => useUpdateStudent())

    await expect(
      result.current.updateStudent('student-1', basePayload()),
    ).rejects.toThrow('permission denied')
  })
})
