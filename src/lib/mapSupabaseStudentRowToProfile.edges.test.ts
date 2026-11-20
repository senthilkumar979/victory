import { afterEach, describe, expect, it, vi } from 'vitest'

import { mapSupabaseStudentRowToProfile } from './mapSupabaseStudentRowToProfile'

const baseRow = {
  id: 'stu-1',
  name: 'Ada Lovelace',
  picture: 'https://example.com/ada.jpg',
  role: 'Engineer',
  email: 'ada@example.com',
  batch: '2025',
}

describe('mapSupabaseStudentRowToProfile empty JSON columns', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('preserves an empty cohort_id so it is not treated as missing', () => {
    const profile = mapSupabaseStudentRowToProfile({
      ...baseRow,
      cohort_id: '',
    })

    expect(profile.cohortId).toBe('')
    expect(profile.batch).toBe('2025')
  })

  it('drops a null cohort_id', () => {
    const profile = mapSupabaseStudentRowToProfile({
      ...baseRow,
      cohort_id: null,
    })

    expect(profile.cohortId).toBeUndefined()
    expect(profile.batch).toBe('2025')
  })

  it('uses fallbacks for blank JSON columns and keeps a JSON null', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const profile = mapSupabaseStudentRowToProfile({
      ...baseRow,
      skill_sets: '   ',
      inspirations: 'null',
      social_links: '',
      experience: '\n',
    })

    expect(profile.skillSets).toEqual([])
    expect(profile.experience).toEqual([])
    expect(profile.socialLinks).toEqual({})
    expect(profile.inspirations).toBeNull()
    expect(warn).toHaveBeenCalled()
  })
})
