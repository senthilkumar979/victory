import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import type { AssignmentSubmission } from '@/types/assignment.types'

import { SubmissionFeedbackView } from './SubmissionFeedbackView'

function makeSubmission(
  overrides: Partial<AssignmentSubmission> = {},
): AssignmentSubmission {
  return {
    id: 'sub-1',
    assignmentId: 'asg-1',
    studentId: 'stu-1',
    googleDocUrl: '',
    githubRepoUrl: '',
    submittedAt: '2026-06-10T00:00:00.000Z',
    updatedAt: '2026-06-10T00:00:00.000Z',
    rating: null,
    feedbackComment: null,
    reviewedBy: null,
    reviewedAt: null,
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('SubmissionFeedbackView', () => {
  it('shows the under-review state when rating is missing', () => {
    render(<SubmissionFeedbackView submission={makeSubmission()} />)

    expect(screen.getByText('Feedback')).toBeInTheDocument()
    expect(
      screen.getByText(/your submission is under review/i),
    ).toBeInTheDocument()
    expect(screen.queryByText('Your feedback')).not.toBeInTheDocument()
  })

  it('renders rating, comment, and mentor fallback when reviewed', () => {
    render(
      <SubmissionFeedbackView
        submission={makeSubmission({
          rating: 4.5,
          feedbackComment: 'Clear write-up.',
          reviewedBy: null,
          reviewedAt: '2026-06-15T10:00:00.000Z',
        })}
      />,
    )

    expect(screen.getByText('Your feedback')).toBeInTheDocument()
    expect(screen.getByText('Clear write-up.')).toBeInTheDocument()
    expect(screen.getByText('4.5 / 5')).toBeInTheDocument()
    expect(screen.getByText(/Reviewed by Mentor/)).toBeInTheDocument()
    expect(screen.getByText(/15/)).toBeInTheDocument()
    expect(screen.getByText(/Jun/)).toBeInTheDocument()
  })

  it('uses the reviewer name when present and omits the date without reviewedAt', () => {
    render(
      <SubmissionFeedbackView
        submission={makeSubmission({
          rating: 3,
          reviewedBy: 'Priya',
          reviewedAt: null,
        })}
      />,
    )

    expect(screen.getByText('Reviewed by Priya')).toBeInTheDocument()
    expect(screen.queryByText(/ · /)).not.toBeInTheDocument()
  })
})
