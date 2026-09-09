import { describe, expect, it } from 'vitest'

import {
  assignmentFormSchema,
  getSubmissionUrlRequirementError,
  hasValidGithubRepoUrl,
  hasValidGoogleDocUrl,
  optionalGithubRepoUrlSchema,
  optionalGoogleDocUrlSchema,
  submissionFeedbackSchema,
} from './assignmentSchemas'

describe('google doc and github url helpers', () => {
  it('accepts empty strings and valid docs/repo urls', () => {
    expect(optionalGoogleDocUrlSchema.safeParse('').success).toBe(true)
    expect(optionalGithubRepoUrlSchema.safeParse('   ').success).toBe(true)
    expect(
      hasValidGoogleDocUrl(
        'https://docs.google.com/document/d/abcXYZ-123/edit',
      ),
    ).toBe(true)
    expect(hasValidGithubRepoUrl('https://github.com/org/repo')).toBe(true)
    expect(hasValidGithubRepoUrl('http://www.github.com/org/repo/')).toBe(true)
  })

  it('rejects whitespace-only docs urls and invalid hosts or repo paths', () => {
    expect(hasValidGoogleDocUrl('   ')).toBe(false)
    expect(hasValidGoogleDocUrl('https://example.com/document/d/abc')).toBe(
      false,
    )
    expect(hasValidGithubRepoUrl('https://gitlab.com/org/repo')).toBe(false)
    expect(hasValidGithubRepoUrl('https://github.com/org/repo/issues')).toBe(
      false,
    )
    expect(hasValidGithubRepoUrl('')).toBe(false)
  })
})

describe('getSubmissionUrlRequirementError', () => {
  it('requires at least one non-empty url', () => {
    expect(
      getSubmissionUrlRequirementError({
        googleDocUrl: '',
        githubRepoUrl: '',
      }),
    ).toBe('Provide at least one URL — Google Doc or GitHub repository')
    expect(
      getSubmissionUrlRequirementError({
        googleDocUrl: '   ',
        githubRepoUrl: '  ',
      }),
    ).toBe('Provide at least one URL — Google Doc or GitHub repository')
    expect(
      getSubmissionUrlRequirementError({
        googleDocUrl: 'https://docs.google.com/document/d/abc/edit',
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

describe('assignmentFormSchema', () => {
  const valid = {
    title: '  Week 1  ',
    description: '  Complete the lab  ',
    cohortId: '11111111-1111-4111-8111-111111111111',
    category: 'Frontend',
    googleGroupId: '  team@test.com  ',
    attachments: '',
    dueDate: '2026-06-15T10:00:00.000Z',
  }

  it('trims required fields and rejects invalid dates or categories', () => {
    const parsed = assignmentFormSchema.parse(valid)
    expect(parsed.title).toBe('Week 1')
    expect(parsed.description).toBe('Complete the lab')
    expect(parsed.googleGroupId).toBe('team@test.com')

    expect(
      assignmentFormSchema.safeParse({ ...valid, title: '   ' }).success,
    ).toBe(false)
    expect(
      assignmentFormSchema.safeParse({ ...valid, category: 'Unknown' }).success,
    ).toBe(false)
    expect(
      assignmentFormSchema.safeParse({ ...valid, dueDate: 'not-a-date' })
        .success,
    ).toBe(false)
    expect(
      assignmentFormSchema.safeParse({ ...valid, cohortId: 'not-a-uuid' })
        .success,
    ).toBe(false)
  })
})

describe('submissionFeedbackSchema', () => {
  it('allows ratings from 1 to 5 with one decimal', () => {
    expect(
      submissionFeedbackSchema.safeParse({
        rating: 3,
        reviewedBy: '  Mentor  ',
        feedbackComment: '  Nice work  ',
      }).success,
    ).toBe(true)
    expect(
      submissionFeedbackSchema.parse({
        rating: 4.5,
        reviewedBy: '  Mentor  ',
      }),
    ).toEqual({
      rating: 4.5,
      reviewedBy: 'Mentor',
    })
  })

  it('rejects out-of-range or two-decimal ratings and blank reviewers', () => {
    expect(
      submissionFeedbackSchema.safeParse({
        rating: 0.9,
        reviewedBy: 'Mentor',
      }).success,
    ).toBe(false)
    expect(
      submissionFeedbackSchema.safeParse({
        rating: 5.1,
        reviewedBy: 'Mentor',
      }).success,
    ).toBe(false)
    expect(
      submissionFeedbackSchema.safeParse({
        rating: 3.25,
        reviewedBy: 'Mentor',
      }).success,
    ).toBe(false)
    expect(
      submissionFeedbackSchema.safeParse({
        rating: 4,
        reviewedBy: '   ',
      }).success,
    ).toBe(false)
  })
})
