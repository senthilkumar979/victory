import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import type { AssignmentSubmission } from '@/types/assignment.types'

import { SubmissionsTable } from './SubmissionsTable'

function makeSubmission(
  overrides: Partial<AssignmentSubmission> = {},
): AssignmentSubmission {
  return {
    id: 'sub-1',
    assignmentId: 'asg-1',
    studentId: 'stu-1',
    studentName: 'Ada Lovelace',
    studentEmail: 'ada@test.com',
    googleDocUrl: '',
    githubRepoUrl: '',
    submittedAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    rating: 4,
    feedbackComment: 'Nice',
    reviewedBy: 'Mentor',
    reviewedAt: '2026-09-02T00:00:00.000Z',
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('SubmissionsTable', () => {
  it('computes review stats and a zero-safe submission percentage', () => {
    const { rerender } = render(
      <SubmissionsTable
        assignmentId="asg-1"
        cohortStudentCount={4}
        submissions={[
          makeSubmission({ id: 'sub-1', rating: 4 }),
          makeSubmission({
            id: 'sub-2',
            studentName: 'Grace Hopper',
            studentEmail: 'grace@test.com',
            rating: null,
          }),
        ]}
      />,
    )

    const stat = (label: string) =>
      screen.getByText(label, { selector: 'p.text-xs' }).nextSibling

    expect(stat('Total students')).toHaveTextContent('4')
    expect(stat('Submitted')).toHaveTextContent('2')
    expect(stat('Reviewed')).toHaveTextContent('1')
    expect(stat('Submission %')).toHaveTextContent('50%')
    expect(
      screen.getByText('2 student(s) have not submitted yet.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: 'Review' })[0],
    ).toHaveAttribute('href', '/secured/assignments/asg-1/submissions/sub-1')

    rerender(
      <SubmissionsTable
        assignmentId="asg-1"
        cohortStudentCount={0}
        submissions={[]}
      />,
    )
    expect(
      screen.getByText('Submission %', { selector: 'p.text-xs' }).nextSibling,
    ).toHaveTextContent('0%')
    expect(
      screen.queryByText(/have not submitted yet/),
    ).not.toBeInTheDocument()
  })

  it('filters by name, email, and review state, and falls back to Unknown', async () => {
    const user = userEvent.setup()
    render(
      <SubmissionsTable
        assignmentId="asg-1"
        cohortStudentCount={3}
        submissions={[
          makeSubmission({
            id: 'sub-1',
            studentName: 'Ada Lovelace',
            studentEmail: 'ada@test.com',
            rating: 5,
          }),
          makeSubmission({
            id: 'sub-2',
            studentName: undefined,
            studentEmail: 'mystery@test.com',
            rating: null,
          }),
        ]}
      />,
    )

    expect(screen.getByText('Unknown')).toBeInTheDocument()

    await user.type(screen.getByPlaceholderText('Search by name...'), 'mystery')
    expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument()
    expect(screen.getByText('mystery@test.com')).toBeInTheDocument()

    await user.clear(screen.getByPlaceholderText('Search by name...'))
    await user.selectOptions(screen.getByRole('combobox'), 'reviewed')
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.queryByText('mystery@test.com')).not.toBeInTheDocument()

    await user.selectOptions(screen.getByRole('combobox'), 'needs_review')
    expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument()
    expect(screen.getByText('mystery@test.com')).toBeInTheDocument()
  })
})
