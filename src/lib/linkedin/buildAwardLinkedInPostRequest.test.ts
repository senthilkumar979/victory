import { afterEach, describe, expect, it } from 'vitest'

import type { AwardFormState } from '@/app/modules/Awards/Award.types'

import {
  buildAwardLinkedInPostBody,
  getAwardLinkedInPrimaryLink,
} from './buildAwardLinkedInPostRequest'

function award(overrides: Partial<AwardFormState> = {}): AwardFormState {
  return {
    awardedTo: 'Ada Lovelace',
    awardedOn: '2026-01-15T18:30:00.000Z',
    description: '<p>Outstanding  work</p>',
    awardCategoryId: 'cat-1',
    student: { name: 'Ada', picture: '', batch: 4 },
    ...overrides,
  }
}

describe('getAwardLinkedInPrimaryLink', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_APP_URL
  })

  it('defaults to mentorbridge.in and strips a trailing slash', () => {
    delete process.env.NEXT_PUBLIC_APP_URL
    expect(getAwardLinkedInPrimaryLink()).toBe('https://mentorbridge.in/hall-of-fame')

    process.env.NEXT_PUBLIC_APP_URL = ' https://app.example.com/ '
    expect(getAwardLinkedInPrimaryLink()).toBe('https://app.example.com/hall-of-fame')
  })
})

describe('buildAwardLinkedInPostBody', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_APP_URL
  })

  it('prefers the student name and strips HTML from the citation', () => {
    const body = buildAwardLinkedInPostBody(award(), 'Excellence')

    expect(body.variant).toBe('award')
    expect(body.title).toBe('Celebrating Ada — Excellence')
    expect(body.description).toBe('Outstanding work')
    expect(body.context).toContain('Awarded to: Ada')
    expect(body.context).toContain('Category: Excellence')
    expect(body.context).toContain('Awarded on: Jan 16, 2026')
    expect(body.context).toContain('Citation / description: Outstanding work')
    expect(body.primaryLink).toBe('https://mentorbridge.in/hall-of-fame')
  })

  it('falls back when the student, category, and description are empty', () => {
    const body = buildAwardLinkedInPostBody(
      award({
        student: { name: '   ', picture: '', batch: 1 },
        awardedTo: '',
        description: '',
        awardedOn: '',
      }),
      '',
    )

    expect(body.title).toBe('Celebrating Student — MentorBridge Award')
    expect(body.description).toBe('Recognition for Student in this category.')
    expect(body.context).toBe(
      ['Awarded to: Student', 'Category: —', 'Awarded on: —'].join('\n'),
    )
  })

  it('uses awardedTo when the student name is missing', () => {
    const body = buildAwardLinkedInPostBody(
      award({ student: undefined, awardedTo: 'Grace Hopper' }),
      'Leadership',
    )

    expect(body.title).toBe('Celebrating Grace Hopper — Leadership')
    expect(body.description).toBe('Outstanding work')
  })
})
