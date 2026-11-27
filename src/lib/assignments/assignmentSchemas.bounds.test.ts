import { describe, expect, it } from 'vitest'

import {
  assignmentFormSchema,
  getSubmissionUrlRequirementError,
  submissionFeedbackSchema,
} from '@/lib/assignments/assignmentSchemas'

const cohortId = '11111111-1111-4111-8111-111111111111'
const atLeastOneUrlMessage =
  'Provide at least one URL — Google Doc or GitHub repository'

function assignmentInput(attachments: string) {
  return {
    title: 'Lab 1',
    description: 'Complete the lab',
    cohortId,
    category: 'Frontend',
    googleGroupId: 'group-1',
    attachments,
    dueDate: '2026-06-10T12:00:00.000Z',
  }
}

describe('assignmentFormSchema attachment URLs', () => {
  it('trims a padded attachment URL', () => {
    const parsed = assignmentFormSchema.parse(
      assignmentInput('  https://files.example.com/spec.pdf  '),
    )

    expect(parsed.attachments).toBe('https://files.example.com/spec.pdf')
  })

  it('stores whitespace-only attachments as an empty string', () => {
    const parsed = assignmentFormSchema.parse(assignmentInput('   '))

    expect(parsed.attachments).toBe('')
  })

  it('rejects an attachment that is not a URL', () => {
    const result = assignmentFormSchema.safeParse(assignmentInput('not a url'))

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        'Enter a valid URL',
      )
    }
  })
})

describe('getSubmissionUrlRequirementError', () => {
  it('rejects a submission when both URLs are blank', () => {
    expect(
      getSubmissionUrlRequirementError({
        googleDocUrl: '',
        githubRepoUrl: '',
      }),
    ).toBe(atLeastOneUrlMessage)
    expect(
      getSubmissionUrlRequirementError({
        googleDocUrl: '  ',
        githubRepoUrl: '\n',
      }),
    ).toBe(atLeastOneUrlMessage)
  })

  it('accepts either a Google Doc or a GitHub repository', () => {
    expect(
      getSubmissionUrlRequirementError({
        googleDocUrl: 'https://docs.google.com/document/d/abc',
        githubRepoUrl: '',
      }),
    ).toBeNull()
    expect(
      getSubmissionUrlRequirementError({
        googleDocUrl: '',
        githubRepoUrl: 'https://github.com/org/repo',
      }),
    ).toBeNull()
  })
})

describe('submissionFeedbackSchema rating bounds', () => {
  it('accepts ratings at both ends of the 1 to 5 scale', () => {
    expect(
      submissionFeedbackSchema.parse({ rating: 1, reviewedBy: 'Ada' }).rating,
    ).toBe(1)
    expect(
      submissionFeedbackSchema.parse({ rating: 5, reviewedBy: 'Ada' }).rating,
    ).toBe(5)
  })

  it('rejects non-finite ratings', () => {
    expect(
      submissionFeedbackSchema.safeParse({
        rating: Number.NaN,
        reviewedBy: 'Ada',
      }).success,
    ).toBe(false)
    expect(
      submissionFeedbackSchema.safeParse({
        rating: Number.POSITIVE_INFINITY,
        reviewedBy: 'Ada',
      }).success,
    ).toBe(false)
  })
})
