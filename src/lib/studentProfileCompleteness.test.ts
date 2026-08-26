import { describe, expect, it } from 'vitest'

import {
  getProfileChecklistItems,
  isStudentProfileComplete,
  isStudentProfileCompleteRow,
} from '@/lib/studentProfileCompleteness'
import type { ProfileData } from '@/types/student.types'

const filledProfile: ProfileData = {
  id: '1',
  name: 'Test',
  picture: 'https://example.com/p.jpg',
  role: 'Engineer',
  company: 'Co',
  summary: 'Hi',
  email: 't@example.com',
  batch: 'B1',
  selfIntro: 'Intro',
  resumeLink: 'https://cv.example',
  socialLinks: { linkedIn: 'https://in.example', gitHub: '', website: '' },
  serialNo: 1,
}

describe('isStudentProfileCompleteRow', () => {
  it('returns false when any required field is missing', () => {
    expect(isStudentProfileCompleteRow({ name: 'A', role: 'Dev', batch: '' })).toBe(
      false,
    )
    expect(isStudentProfileCompleteRow({ name: '', role: 'Dev', batch: '1' })).toBe(
      false,
    )
    expect(isStudentProfileCompleteRow({ name: 'A', role: '', batch: '1' })).toBe(
      false,
    )
  })

  it('returns true when name, role, and batch are non-empty', () => {
    expect(
      isStudentProfileCompleteRow({
        name: 'Ada',
        role: 'Student',
        batch: '2025',
      }),
    ).toBe(true)
  })

  it('accepts cohort_id or cohortId as the cohort source', () => {
    expect(
      isStudentProfileCompleteRow({
        name: 'Ada',
        role: 'Dev',
        cohort_id: 'cohort-1',
      }),
    ).toBe(true)
    expect(
      isStudentProfileCompleteRow({
        name: 'Ada',
        role: 'Dev',
        cohortId: 'cohort-2',
      }),
    ).toBe(true)
  })

  it('trims whitespace', () => {
    expect(
      isStudentProfileCompleteRow({
        name: '  Ada  ',
        role: '  Dev  ',
        batch: '  1  ',
      }),
    ).toBe(true)
  })
})

describe('isStudentProfileComplete', () => {
  it('returns false for a missing profile', () => {
    expect(isStudentProfileComplete(null)).toBe(false)
  })

  it('uses cohortId when batch is empty', () => {
    expect(
      isStudentProfileComplete({
        ...filledProfile,
        batch: '   ',
        cohortId: 'cohort-9',
      }),
    ).toBe(true)
  })
})

describe('getProfileChecklistItems', () => {
  it('returns load message when profile is null', () => {
    const items = getProfileChecklistItems(null)
    expect(items).toHaveLength(1)
    expect(items[0].done).toBe(false)
  })

  it('marks required items done for a filled profile', () => {
    const items = getProfileChecklistItems(filledProfile)
    expect(items.every((i) => i.done)).toBe(true)
  })

  it('treats GitHub-only social links as complete and empty socials as incomplete', () => {
    const githubOnly = getProfileChecklistItems({
      ...filledProfile,
      socialLinks: { linkedIn: '  ', gitHub: 'https://github.com/ada' },
    })
    expect(githubOnly.find((i) => i.id === 'social')?.done).toBe(true)

    const none = getProfileChecklistItems({
      ...filledProfile,
      picture: '  ',
      socialLinks: { linkedIn: '', gitHub: '' },
    })
    expect(none.find((i) => i.id === 'picture')?.done).toBe(false)
    expect(none.find((i) => i.id === 'social')?.done).toBe(false)
  })
})
