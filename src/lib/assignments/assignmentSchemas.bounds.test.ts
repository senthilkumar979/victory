import { describe, expect, it } from 'vitest'

import {
  assignmentFormSchema,
  submissionFeedbackSchema,
} from './assignmentSchemas'

const validAssignment = {
  title: 'Week 1',
  description: 'Complete the lab',
  cohortId: '11111111-1111-4111-8111-111111111111',
  category: 'Frontend',
  googleGroupId: 'team@test.com',
  attachments: '',
  dueDate: '2026-06-15T10:00:00.000Z',
}

describe('assignment attachment URLs', () => {
  it('trims a real URL and treats whitespace as no attachment', () => {
    const parsed = assignmentFormSchema.parse({
      ...validAssignment,
      attachments: '  https://files.example.com/spec.pdf  ',
    })

    expect(parsed.attachments).toBe('https://files.example.com/spec.pdf')
    expect(
      assignmentFormSchema.parse({
        ...validAssignment,
        attachments: '   ',
      }).attachments,
    ).toBe('')
  })

  it('rejects an attachment that is not a URL', () => {
    const result = assignmentFormSchema.safeParse({
      ...validAssignment,
      attachments: 'not a url',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === 'Enter a valid URL')).toBe(
        true,
      )
    }
  })
})

describe('submission feedback rating bounds', () => {
  it('accepts the inclusive 1 and 5 boundaries', () => {
    expect(
      submissionFeedbackSchema.parse({ rating: 1, reviewedBy: 'Mentor' }).rating,
    ).toBe(1)
    expect(
      submissionFeedbackSchema.parse({ rating: 5, reviewedBy: 'Mentor' }).rating,
    ).toBe(5)
  })

  it('rejects non-finite ratings', () => {
    expect(
      submissionFeedbackSchema.safeParse({ rating: Number.NaN, reviewedBy: 'Mentor' })
        .success,
    ).toBe(false)
    expect(
      submissionFeedbackSchema.safeParse({
        rating: Number.POSITIVE_INFINITY,
        reviewedBy: 'Mentor',
      }).success,
    ).toBe(false)
  })
})
