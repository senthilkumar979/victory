import { describe, expect, it, vi } from 'vitest'

import { toSupabasePayload } from './useUpdateStudent'
import type { ProfileUpdatePayload } from './useUpdateStudent'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

function basePayload(
  overrides: Partial<ProfileUpdatePayload> = {},
): ProfileUpdatePayload {
  return {
    name: 'Ada Lovelace',
    role: 'Engineer',
    email: 'ada@example.com',
    cohortId: 'cohort-1',
    ...overrides,
  }
}

describe('toSupabasePayload blank and partial fields', () => {
  it('stores blank optional text as null and keeps empty arrays', () => {
    expect(
      toSupabasePayload(
        basePayload({
          id: '  student-1  ',
          picture: '   ',
          company: '',
          mediumUsername: '  ',
          resumeLink: '',
          skillSets: [],
          experience: [],
        }),
      ),
    ).toMatchObject({
      id: 'student-1',
      picture: null,
      company: null,
      summary: null,
      medium_username: null,
      resume_link: null,
      skill_sets: [],
      inspirations: null,
      experience: [],
      mentor_bridge_exp: null,
    })
  })

  it('leaves the other guardian column unset on a partial update', () => {
    const fatherOnly = toSupabasePayload(
      basePayload({ fatherGuardianDetails: '  Dad  ' }),
    )
    expect(fatherOnly.father_guardian_details).toBe('Dad')
    expect(fatherOnly).not.toHaveProperty('mother_details')

    const motherOnly = toSupabasePayload(basePayload({ motherDetails: 'Mom' }))
    expect(motherOnly.mother_details).toBe('Mom')
    expect(motherOnly).not.toHaveProperty('father_guardian_details')
  })

  it('stores only M or F and drops full gender words', () => {
    expect(toSupabasePayload(basePayload({ gender: 'male' })).gender).toBeNull()
    expect(toSupabasePayload(basePayload({ gender: 'female' })).gender).toBeNull()
    expect(toSupabasePayload(basePayload({ gender: 'F' })).gender).toBe('F')
  })

  it('stores a missing id as null', () => {
    expect(toSupabasePayload(basePayload()).id).toBeNull()
  })
})
