import { describe, expect, it } from 'vitest'

import {
  getProfileChecklistItems,
  isStudentProfileCompleteRow,
} from '@/lib/studentProfileCompleteness'
import type { ProfileData } from '@/types/student.types'

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

describe('getProfileChecklistItems', () => {
  it('returns load message when profile is null', () => {
    const items = getProfileChecklistItems(null)
    expect(items).toHaveLength(1)
    expect(items[0].done).toBe(false)
  })

  it('marks required items done for a filled profile', () => {
    const profile: ProfileData = {
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
    const items = getProfileChecklistItems(profile)
    expect(items.every((i) => i.done)).toBe(true)
  })
})
