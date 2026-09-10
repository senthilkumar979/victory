import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { AssignmentListItem, AssignmentSubmission } from '@/types/assignment.types'

import { MemberDashboardFeedbackSection } from './MemberDashboardVideosSection'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/components/assignments/SubmissionFeedbackView', () => ({
  SubmissionFeedbackView: ({
    submission,
  }: {
    submission: AssignmentSubmission
  }) => <p>Rating {submission.rating}</p>,
}))

function makeAssignment(
  overrides: Partial<AssignmentListItem> = {},
): AssignmentListItem {
  return {
    id: 'asg-1',
    title: 'Week 1',
    description: 'Intro',
    cohortId: 'cohort-1',
    category: 'Frontend',
    googleGroupId: 'g1',
    attachments: null,
    dueDate: '2026-06-15T10:00:00.000Z',
    createdBy: 'admin',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    stats: {
      totalStudents: 10,
      submittedCount: 1,
      pendingCount: 9,
      submissionPercentage: 10,
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
    googleDocUrl: '',
    githubRepoUrl: '',
    submittedAt: '2026-06-10T00:00:00.000Z',
    updatedAt: '2026-06-10T00:00:00.000Z',
    rating: 4,
    feedbackComment: 'Nice work',
    reviewedBy: 'Mentor',
    reviewedAt: '2026-06-12T00:00:00.000Z',
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('MemberDashboardFeedbackSection', () => {
  it('hides the section while loading or when no rated submissions exist', () => {
    const assignments = [makeAssignment()]
    const { rerender } = render(
      <MemberDashboardFeedbackSection
        assignments={assignments}
        submissions={{ 'asg-1': makeSubmission() }}
        isLoading
      />,
    )

    expect(screen.queryByText('Recent feedback')).not.toBeInTheDocument()

    rerender(
      <MemberDashboardFeedbackSection
        assignments={assignments}
        submissions={{ 'asg-1': makeSubmission({ rating: null }) }}
        isLoading={false}
      />,
    )
    expect(screen.queryByText('Recent feedback')).not.toBeInTheDocument()

    rerender(
      <MemberDashboardFeedbackSection
        assignments={assignments}
        submissions={{ 'asg-1': null }}
        isLoading={false}
      />,
    )
    expect(screen.queryByText('Recent feedback')).not.toBeInTheDocument()
  })

  it('keeps only the first three submissions that have a rating', () => {
    const assignments = [1, 2, 3, 4, 5].map((n) =>
      makeAssignment({ id: `asg-${n}`, title: `Week ${n}` }),
    )

    render(
      <MemberDashboardFeedbackSection
        assignments={assignments}
        submissions={{
          'asg-1': makeSubmission({ id: 's1', rating: 5 }),
          'asg-2': makeSubmission({ id: 's2', rating: null }),
          'asg-3': makeSubmission({ id: 's3', rating: 3 }),
          'asg-4': makeSubmission({ id: 's4', rating: 4 }),
          'asg-5': makeSubmission({ id: 's5', rating: 2 }),
        }}
        isLoading={false}
      />,
    )

    expect(screen.getByText('Recent feedback')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Week 1' })).toHaveAttribute(
      'href',
      '/secured/assignments/asg-1',
    )
    expect(screen.queryByText('Week 2')).not.toBeInTheDocument()
    expect(screen.getByText('Week 3')).toBeInTheDocument()
    expect(screen.getByText('Week 4')).toBeInTheDocument()
    expect(screen.queryByText('Week 5')).not.toBeInTheDocument()
    expect(screen.getAllByText(/Rating /)).toHaveLength(3)
  })
})
