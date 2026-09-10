import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { AssignmentListItem } from '@/types/assignment.types'

import {
  MemberDashboardActionItems,
  MemberDashboardAssignmentsSection,
} from './MemberDashboardAssignmentsSection'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

function makeAssignment(
  overrides: Partial<AssignmentListItem> = {},
): AssignmentListItem {
  return {
    id: 'asg-1',
    title: 'Forms homework',
    description: 'Build a form',
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
      submittedCount: 3,
      pendingCount: 7,
      submissionPercentage: 30,
    },
    dueStatus: 'upcoming',
    mySubmissionStatus: 'not_submitted',
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('MemberDashboardActionItems', () => {
  it('returns nothing while loading or when every assignment is submitted and not due soon', () => {
    const { rerender } = render(
      <MemberDashboardActionItems assignments={[]} isLoading />,
    )

    expect(screen.queryByText('Action items')).not.toBeInTheDocument()

    rerender(
      <MemberDashboardActionItems
        isLoading={false}
        assignments={[
          makeAssignment({
            dueStatus: 'upcoming',
            mySubmissionStatus: 'submitted',
          }),
          makeAssignment({
            id: 'asg-past',
            dueStatus: 'past_due',
            mySubmissionStatus: 'submitted',
          }),
        ]}
      />,
    )

    expect(screen.queryByText('Action items')).not.toBeInTheDocument()
  })

  it('splits due-soon, past-due unsubmitted, and still-open work', () => {
    render(
      <MemberDashboardActionItems
        isLoading={false}
        assignments={[
          makeAssignment({
            id: 'soon-1',
            dueStatus: 'due_soon',
            mySubmissionStatus: 'not_submitted',
          }),
          makeAssignment({
            id: 'soon-2',
            dueStatus: 'upcoming',
            mySubmissionStatus: 'submitted',
          }),
          makeAssignment({
            id: 'late-1',
            dueStatus: 'past_due',
            mySubmissionStatus: 'not_submitted',
          }),
          makeAssignment({
            id: 'open-1',
            dueStatus: 'upcoming',
            mySubmissionStatus: 'not_submitted',
          }),
        ]}
      />,
    )

    expect(screen.getByText('1 assignment due soon')).toBeInTheDocument()
    expect(screen.getByText('1 past due — not submitted')).toBeInTheDocument()
    expect(screen.getByText('2 open assignments to submit')).toBeInTheDocument()
  })
})

describe('MemberDashboardAssignmentsSection', () => {
  it('prefers the loading pulse over an error and sorts the five soonest dues', () => {
    const { rerender } = render(
      <MemberDashboardAssignmentsSection
        assignments={[]}
        isLoading
        error="Could not load"
      />,
    )

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    rerender(
      <MemberDashboardAssignmentsSection
        assignments={[]}
        isLoading={false}
        error="Could not load"
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load')

    const assignments = Array.from({ length: 6 }, (_, index) =>
      makeAssignment({
        id: `asg-${index}`,
        title: `Assignment ${index}`,
        dueDate: `2026-06-${String(20 - index).padStart(2, '0')}T10:00:00.000Z`,
      }),
    )

    rerender(
      <MemberDashboardAssignmentsSection
        assignments={assignments}
        isLoading={false}
        error={null}
      />,
    )

    const titles = screen.getAllByRole('link', { name: /Assignment \d/ })
    expect(titles).toHaveLength(5)
    expect(titles[0]).toHaveTextContent('Assignment 5')
    expect(titles[4]).toHaveTextContent('Assignment 1')
    expect(screen.queryByText('Assignment 0')).not.toBeInTheDocument()
  })
})
