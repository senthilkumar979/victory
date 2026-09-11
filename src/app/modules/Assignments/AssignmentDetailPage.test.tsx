import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type {
  AssignmentListItem,
  AssignmentSubmission,
} from '@/types/assignment.types'

import { AssignmentDetailPage } from './AssignmentDetailPage'

const useAssignmentMock = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useAssignment', () => ({
  useAssignment: (...args: unknown[]) => useAssignmentMock(...args),
}))

vi.mock('@/components/assignments/MarkdownContent', () => ({
  MarkdownContent: ({ content }: { content: string }) => <div>{content}</div>,
}))

vi.mock('@/components/assignments/GoogleDocPreview', () => ({
  GoogleDocPreview: ({ url }: { url: string }) => <div>Doc preview {url}</div>,
}))

vi.mock('@/components/assignments/GitHubRepoPreview', () => ({
  GitHubRepoPreview: ({ repoUrl }: { repoUrl: string }) => (
    <div>Repo preview {repoUrl}</div>
  ),
}))

vi.mock('@/components/assignments/SubmissionFeedbackView', () => ({
  SubmissionFeedbackView: () => <div>Feedback view</div>,
}))

vi.mock('./SubmissionsTable', () => ({
  SubmissionsTable: () => <div>Submissions table</div>,
}))

vi.mock('./SubmissionFormDrawer', () => ({
  SubmissionFormDrawer: ({
    isOpen,
    readOnly,
  }: {
    isOpen: boolean
    readOnly: boolean
  }) => (
    <div
      data-testid="submission-drawer"
      data-open={String(isOpen)}
      data-readonly={String(readOnly)}
    />
  ),
}))

const futureDue = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
const pastDue = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

function makeAssignment(
  overrides: Partial<AssignmentListItem> = {},
): AssignmentListItem {
  return {
    id: 'asg-1',
    title: 'Build the API',
    description: 'Ship the endpoints',
    cohortId: 'cohort-1',
    cohortName: 'Batch 9',
    category: 'Backend',
    googleGroupId: 'team@test.com',
    attachments: null,
    dueDate: futureDue,
    createdBy: 'admin-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    stats: {
      totalStudents: 10,
      submittedCount: 2,
      pendingCount: 8,
      submissionPercentage: 20,
    },
    dueStatus: 'upcoming',
    ...overrides,
  }
}

function makeSubmission(
  overrides: Partial<AssignmentSubmission> = {},
): AssignmentSubmission {
  return {
    id: 'sub-1',
    assignmentId: 'asg-1',
    studentId: 'stu-1',
    studentName: 'Ada',
    studentEmail: 'ada@test.com',
    googleDocUrl: 'https://docs.google.com/document/d/abc',
    githubRepoUrl: 'https://github.com/ada/api',
    submittedAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-02T00:00:00.000Z',
    rating: 4,
    feedbackComment: 'Solid',
    reviewedBy: 'Mentor',
    reviewedAt: '2026-09-03T00:00:00.000Z',
    ...overrides,
  }
}

function mockAssignment(
  overrides: Partial<ReturnType<typeof useAssignmentMock>> = {},
) {
  useAssignmentMock.mockReturnValue({
    assignment: makeAssignment(),
    mySubmission: null,
    submissions: null,
    isAdmin: false,
    canSubmit: true,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  })
}

afterEach(() => {
  cleanup()
})

beforeEach(() => {
  useAssignmentMock.mockReset()
})

describe('AssignmentDetailPage', () => {
  it('shows loading and error states', () => {
    mockAssignment({ isLoading: true, assignment: null })
    const { rerender } = render(
      <AssignmentDetailPage assignmentId="asg-1" />,
    )
    expect(screen.getByText('Loading assignment...')).toBeInTheDocument()

    mockAssignment({
      isLoading: false,
      assignment: null,
      error: 'Failed to load assignment',
    })
    rerender(<AssignmentDetailPage assignmentId="asg-1" />)
    expect(screen.getByText('Failed to load assignment')).toBeInTheDocument()
  })

  it('lets a student submit when the deadline is open', async () => {
    const user = userEvent.setup()
    mockAssignment({
      assignment: makeAssignment({ attachments: 'https://files.example/spec' }),
      canSubmit: true,
      isAdmin: false,
    })
    render(<AssignmentDetailPage assignmentId="asg-1" />)

    expect(screen.getByText('Not submitted')).toBeInTheDocument()
    expect(screen.getByText(/Cohort Batch 9/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /attachments/i })).toHaveAttribute(
      'href',
      'https://files.example/spec',
    )

    await user.click(screen.getByRole('button', { name: 'Submit assignment' }))
    expect(screen.getByTestId('submission-drawer')).toHaveAttribute(
      'data-open',
      'true',
    )
    expect(screen.getByTestId('submission-drawer')).toHaveAttribute(
      'data-readonly',
      'false',
    )
  })

  it('blocks student edits after the deadline and still lets admins write', () => {
    mockAssignment({
      assignment: makeAssignment({
        dueDate: pastDue,
        dueStatus: 'past_due',
      }),
      mySubmission: makeSubmission(),
      canSubmit: true,
      isAdmin: false,
    })
    const { rerender } = render(
      <AssignmentDetailPage assignmentId="asg-1" />,
    )

    expect(screen.getByText('Submitted')).toBeInTheDocument()
    expect(
      screen.getByText('Submission deadline has passed.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Edit submission' }),
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('submission-drawer')).toHaveAttribute(
      'data-readonly',
      'true',
    )

    mockAssignment({
      assignment: makeAssignment({
        dueDate: pastDue,
        dueStatus: 'past_due',
      }),
      mySubmission: null,
      submissions: [makeSubmission()],
      canSubmit: true,
      isAdmin: true,
    })
    rerender(<AssignmentDetailPage assignmentId="asg-1" />)

    expect(screen.queryByText('Not submitted')).not.toBeInTheDocument()
    expect(screen.queryByText('My submission')).not.toBeInTheDocument()
    expect(screen.getByText('Submissions table')).toBeInTheDocument()
    expect(screen.getByTestId('submission-drawer')).toHaveAttribute(
      'data-readonly',
      'false',
    )
  })

  it('hides the student submission panel when canSubmit is false', () => {
    mockAssignment({ canSubmit: false, isAdmin: false })
    render(<AssignmentDetailPage assignmentId="asg-1" />)

    expect(screen.queryByText('My submission')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Submit assignment' }),
    ).not.toBeInTheDocument()
  })
})
