import { describe, expect, it } from 'vitest'

import {
  assignmentFormSchema,
  getSubmissionUrlRequirementError,
  hasValidGithubRepoUrl,
  hasValidGoogleDocUrl,
  optionalGithubRepoUrlSchema,
  optionalGoogleDocUrlSchema,
  submissionFeedbackSchema,
  submissionFieldsSchema,
} from './assignmentSchemas'

const validAssignment = {
  title: 'Week 1 Lab',
  description: 'Build the API',
  cohortId: '11111111-1111-4111-8111-111111111111',
  category: 'Backend',
  googleGroupId: 'group-1',
  attachments: '',
  dueDate: '2026-08-01T12:00:00.000Z',
}

describe('assignmentFormSchema', () => {
  it('accepts a complete assignment payload', () => {
    expect(assignmentFormSchema.safeParse(validAssignment).success).toBe(true)
  })

  it('rejects unknown categories and invalid cohort ids', () => {
    const parsed = assignmentFormSchema.safeParse({
      ...validAssignment,
      category: 'DevOps',
      cohortId: 'not-a-uuid',
    })

    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      const messages = parsed.error.issues.map((issue) => issue.message)
      expect(messages).toContain('Select a category')
      expect(messages).toContain('Select a cohort')
    }
  })

  it('rejects blank required fields and invalid due dates', () => {
    const parsed = assignmentFormSchema.safeParse({
      ...validAssignment,
      title: '   ',
      description: '',
      googleGroupId: ' ',
      dueDate: 'not-a-date',
      attachments: 'notaurl',
    })

    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      const messages = parsed.error.issues.map((issue) => issue.message)
      expect(messages).toContain('Title is required')
      expect(messages).toContain('Description is required')
      expect(messages).toContain('Select a Google Group')
      expect(messages).toContain('Invalid date')
      expect(messages).toContain('Enter a valid URL')
    }
  })
})

describe('submission url helpers', () => {
  it('accepts empty optional urls and validates Google Doc / GitHub shapes', () => {
    expect(optionalGoogleDocUrlSchema.safeParse('').success).toBe(true)
    expect(optionalGithubRepoUrlSchema.safeParse('').success).toBe(true)
    expect(
      hasValidGoogleDocUrl(
        'https://docs.google.com/document/d/abc123XYZ_-/edit',
      ),
    ).toBe(true)
    expect(hasValidGoogleDocUrl('https://example.com/doc')).toBe(false)
    expect(hasValidGithubRepoUrl('https://github.com/org/repo')).toBe(true)
    expect(hasValidGithubRepoUrl('https://github.com/org/repo/issues')).toBe(
      false,
    )
  })

  it('requires at least one submission url when both fields are blank', () => {
    expect(
      getSubmissionUrlRequirementError({
        googleDocUrl: '  ',
        githubRepoUrl: '',
      }),
    ).toBe('Provide at least one URL — Google Doc or GitHub repository')

    expect(
      getSubmissionUrlRequirementError({
        googleDocUrl: '',
        githubRepoUrl: 'https://github.com/org/repo',
      }),
    ).toBeNull()
  })

  it('parses submission fields independently of the at-least-one rule', () => {
    expect(
      submissionFieldsSchema.safeParse({
        googleDocUrl: '',
        githubRepoUrl: '',
      }).success,
    ).toBe(true)
  })
})

describe('submissionFeedbackSchema', () => {
  it('accepts ratings with one decimal place', () => {
    expect(
      submissionFeedbackSchema.safeParse({
        rating: 4.5,
        reviewedBy: 'Ada',
        feedbackComment: 'Solid work',
      }).success,
    ).toBe(true)
  })

  it('rejects out-of-range ratings and blank reviewer names', () => {
    const parsed = submissionFeedbackSchema.safeParse({
      rating: 5.05,
      reviewedBy: '   ',
    })

    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      const messages = parsed.error.issues.map((issue) => issue.message)
      expect(messages).toContain(
        'Enter a rating between 1 and 5 (one decimal allowed)',
      )
      expect(messages).toContain('Reviewer name is required')
    }
  })

  it('rejects ratings outside 1–5', () => {
    expect(
      submissionFeedbackSchema.safeParse({
        rating: 0.9,
        reviewedBy: 'Ada',
      }).success,
    ).toBe(false)
    expect(
      submissionFeedbackSchema.safeParse({
        rating: 5.1,
        reviewedBy: 'Ada',
      }).success,
    ).toBe(false)
  })
})
