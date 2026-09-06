import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AssignmentSubmission } from '@/types/assignment.types'

import { SubmissionFeedbackForm } from './SubmissionFeedbackForm'

const { successToastMock, errorToastMock } = vi.hoisted(() => ({
  successToastMock: vi.fn(),
  errorToastMock: vi.fn(),
}))

vi.mock('goey-toast', () => ({
  gooeyToast: {
    success: successToastMock,
    error: errorToastMock,
  },
}))

function makeSubmission(
  overrides: Partial<AssignmentSubmission> = {},
): AssignmentSubmission {
  return {
    id: 'sub-1',
    assignmentId: 'asg-1',
    studentId: 'stu-1',
    googleDocUrl: 'https://docs.google.com/document/d/abc',
    githubRepoUrl: '',
    submittedAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z',
    rating: null,
    feedbackComment: null,
    reviewedBy: null,
    reviewedAt: null,
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('SubmissionFeedbackForm', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('PATCHes feedback and notifies the parent on success', async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn()
    const saved = makeSubmission({
      rating: 4.5,
      reviewedBy: 'Ada',
      feedbackComment: 'Solid work',
      reviewedAt: '2026-06-02T08:00:00.000Z',
    })
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ submission: saved }),
    })

    render(
      <SubmissionFeedbackForm
        assignmentId="asg-1"
        submission={makeSubmission()}
        onSaved={onSaved}
      />,
    )

    expect(screen.getByRole('spinbutton')).toHaveValue(3)

    await user.clear(screen.getByRole('spinbutton'))
    await user.type(screen.getByRole('spinbutton'), '4.5')
    await user.type(
      screen.getByPlaceholderText('Your name as shown to the student'),
      'Ada',
    )
    await user.type(
      screen.getByPlaceholderText('What went well? What can improve?'),
      'Solid work',
    )
    await user.click(screen.getByRole('button', { name: 'Save feedback' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/assignments/asg-1/submissions/sub-1/feedback',
      expect.objectContaining({
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: 4.5,
          reviewedBy: 'Ada',
          feedbackComment: 'Solid work',
        }),
      }),
    )
    expect(successToastMock).toHaveBeenCalledWith(
      'Feedback saved.',
      expect.objectContaining({
        description: 'The student has been notified by email.',
      }),
    )
    expect(onSaved).toHaveBeenCalledWith(saved)
    expect(errorToastMock).not.toHaveBeenCalled()
  })

  it('surfaces API error strings and keeps the parent unchanged', async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn()
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Only mentors can review' }),
    })

    render(
      <SubmissionFeedbackForm
        assignmentId="asg-1"
        submission={makeSubmission({
          rating: 4,
          reviewedBy: 'Ada',
          feedbackComment: 'Nice',
        })}
        onSaved={onSaved}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save feedback' }))

    await waitFor(() =>
      expect(errorToastMock).toHaveBeenCalledWith(
        'Failed to save feedback.',
        expect.objectContaining({ description: 'Only mentors can review' }),
      ),
    )
    expect(onSaved).not.toHaveBeenCalled()
    expect(successToastMock).not.toHaveBeenCalled()
  })

  it('falls back when the API error body has no message', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    })

    render(
      <SubmissionFeedbackForm
        assignmentId="asg-1"
        submission={makeSubmission({ rating: 2, reviewedBy: 'Ada' })}
        onSaved={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save feedback' }))

    await waitFor(() =>
      expect(errorToastMock).toHaveBeenCalledWith(
        'Failed to save feedback.',
        expect.objectContaining({ description: 'Failed to save feedback' }),
      ),
    )
  })
})
