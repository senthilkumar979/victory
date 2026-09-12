import { describe, expect, it } from 'vitest'

import type { ProfileData } from '@/types/student.types'

import {
  collectFormErrorMessages,
  getThrownMessage,
  humanizeValidatorMessage,
  parseCommaList,
  toFormValues,
} from './profileEditFormMapping'

function makeStudent(overrides: Partial<ProfileData> = {}): ProfileData {
  return {
    id: 'stu-1',
    name: 'Ada',
    picture: '',
    role: 'Frontend Engineer',
    email: 'ada@test.com',
    batch: '12',
    ...overrides,
  }
}

describe('toFormValues', () => {
  it('returns empty defaults when student is null', () => {
    expect(toFormValues(null)).toMatchObject({
      name: '',
      email: '',
      cohortId: '',
      gender: '',
      skillSets: '',
      experience: [],
    })
  })

  it('maps only trimmed M/F gender and joins skill lists', () => {
    expect(
      toFormValues(
        makeStudent({
          gender: ' f ',
          skillSets: ['React', 'TS'],
          inspirations: ['Kalam'],
        }),
      ),
    ).toMatchObject({
      gender: 'F',
      skillSets: 'React, TS',
      inspirations: 'Kalam',
    })

    expect(toFormValues(makeStudent({ gender: 'other' })).gender).toBe('')
    expect(toFormValues(makeStudent({ gender: '  ' })).gender).toBe('')
  })

  it('omits mentorBridgeExp unless present and fills missing experience fields', () => {
    expect(toFormValues(makeStudent()).mentorBridgeExp).toBeUndefined()
    expect(
      toFormValues(
        makeStudent({
          mentorBridgeExp: { company: 'MB', role: 'Intern', summary: '' },
          experience: [{ company: 'Acme', role: '', summary: '' }],
        }),
      ),
    ).toMatchObject({
      mentorBridgeExp: {
        company: 'MB',
        role: 'Intern',
        summary: '',
        website: '',
      },
      experience: [{ company: 'Acme', role: '', summary: '', website: '' }],
    })
  })
})

describe('parseCommaList', () => {
  it('treats blank, whitespace, and empty tokens as no values', () => {
    expect(parseCommaList(undefined)).toEqual([])
    expect(parseCommaList('   ')).toEqual([])
    expect(parseCommaList(' React, , TypeScript , ')).toEqual([
      'React',
      'TypeScript',
    ])
  })
})

describe('humanizeValidatorMessage', () => {
  it('rewrites Zod undefined/null string errors and leaves other copy intact', () => {
    expect(
      humanizeValidatorMessage('Expected string, received undefined'),
    ).toMatch(/experience blocks/)
    expect(
      humanizeValidatorMessage('expected string, received null'),
    ).toMatch(/invalid empty value/)
    expect(humanizeValidatorMessage('  Full name is required  ')).toBe(
      'Full name is required',
    )
  })
})

describe('collectFormErrorMessages', () => {
  it('walks nested field errors, humanizes, and de-duplicates', () => {
    expect(
      collectFormErrorMessages({
        name: { type: 'required', message: 'Full name is required' },
        experience: [
          {
            company: {
              type: 'invalid_type',
              message: 'Expected string, received undefined',
            },
          },
        ],
        socialLinks: {
          linkedIn: { type: 'required', message: 'Full name is required' },
        },
      }),
    ).toEqual([
      'Full name is required',
      'A field is empty or missing. Check all sections (including experience blocks) and try again.',
    ])
  })
})

describe('getThrownMessage', () => {
  it('prefers Error, string, then object.message, else the fallback', () => {
    expect(getThrownMessage(new Error('DB down'))).toBe('DB down')
    expect(getThrownMessage('timeout')).toBe('timeout')
    expect(getThrownMessage({ message: '  row missing  ' })).toBe(
      '  row missing  ',
    )
    expect(getThrownMessage({ message: '   ' })).toBe('Please try again.')
    expect(getThrownMessage({ message: 404 })).toBe('Please try again.')
    expect(getThrownMessage(null)).toBe('Please try again.')
  })
})
