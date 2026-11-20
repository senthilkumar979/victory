import { describe, expect, it } from 'vitest'

import {
  getProfileChecklistItems,
  isStudentProfileComplete,
  isStudentProfileCompleteRow,
} from '@/lib/studentProfileCompleteness'
import type { ProfileData } from '@/types/student.types'

function profile(overrides: Partial<ProfileData> = {}): ProfileData {
  return {
    id: '1',
    name: 'Ada',
    picture: '',
    role: 'Student',
    email: 'ada@example.com',
    batch: '2025',
    serialNo: 1,
    ...overrides,
  }
}

function doneById(items: ReturnType<typeof getProfileChecklistItems>) {
  return Object.fromEntries(items.map((item) => [item.id, item.done]))
}

describe('profile completeness cohort fallback', () => {
  it('keeps an empty cohort id ahead of a stored batch', () => {
    expect(
      isStudentProfileComplete(
        profile({ cohortId: '', batch: '2025', role: 'Student', name: 'Ada' }),
      ),
    ).toBe(false)
    expect(
      isStudentProfileComplete(
        profile({
          cohortId: '   ',
          batch: '2025',
          role: 'Student',
          name: 'Ada',
        }),
      ),
    ).toBe(false)
  })

  it('uses batch when cohort id is missing', () => {
    expect(
      isStudentProfileComplete(
        profile({ cohortId: undefined, batch: '2025', name: 'Ada', role: 'Student' }),
      ),
    ).toBe(true)
  })

  it('does not treat a blank cohort_id as missing when another id is present', () => {
    expect(
      isStudentProfileCompleteRow({
        name: 'Ada',
        role: 'Dev',
        cohort_id: '',
        cohortId: 'cohort-9',
        batch: '2025',
      }),
    ).toBe(false)
    expect(
      isStudentProfileCompleteRow({
        name: 'Ada',
        role: 'Dev',
        cohort_id: '   ',
        cohortId: 'cohort-9',
      }),
    ).toBe(false)
  })

  it('falls through a null cohort_id to cohortId', () => {
    expect(
      isStudentProfileCompleteRow({
        name: 'Ada',
        role: 'Dev',
        cohort_id: null,
        cohortId: 'cohort-9',
        batch: '',
      }),
    ).toBe(true)
  })

  it('rejects a whitespace-only name', () => {
    expect(
      isStudentProfileComplete(profile({ name: '   ', role: 'Student', batch: '2025' })),
    ).toBe(false)
  })
})

describe('profile checklist social and blank fields', () => {
  it('requires LinkedIn or GitHub and ignores a website-only link', () => {
    const websiteOnly = doneById(
      getProfileChecklistItems(
        profile({
          socialLinks: { linkedIn: '', gitHub: '', website: 'https://ada.dev' },
        }),
      ),
    )
    expect(websiteOnly.social).toBe(false)

    const whitespaceSocial = doneById(
      getProfileChecklistItems(
        profile({
          socialLinks: {
            linkedIn: '   ',
            gitHub: '  ',
            website: 'https://ada.dev',
          },
        }),
      ),
    )
    expect(whitespaceSocial.social).toBe(false)
  })

  it('leaves social undone when social links are missing', () => {
    const items = getProfileChecklistItems(profile({ socialLinks: undefined }))
    expect(items.find((item) => item.id === 'social')?.done).toBe(false)
  })

  it('marks trimmed-empty profile fields undone, including cohort when cohortId is blank', () => {
    const flags = doneById(
      getProfileChecklistItems(
        profile({
          name: '  ',
          role: '  ',
          picture: '   ',
          summary: ' ',
          resumeLink: '  ',
          selfIntro: '   ',
          cohortId: '',
          batch: '2025',
        }),
      ),
    )

    expect(flags).toMatchObject({
      name: false,
      role: false,
      cohort: false,
      picture: false,
      summary: false,
      resume: false,
      selfIntro: false,
    })
  })
})
