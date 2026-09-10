import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { AssignmentListItem } from '@/types/assignment.types'

import { AssignmentCard } from './AssignmentCard'

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
    title: 'Week 3 homework',
    description: 'Build a form',
    cohortId: 'cohort-1',
    cohortName: 'Batch 8',
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
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('AssignmentCard', () => {
  it('hides admin actions for students even when callbacks are provided', () => {
    render(
      <AssignmentCard
        assignment={makeAssignment()}
        isAdmin={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByRole('link', { name: 'Open Assignment' })).toHaveAttribute(
      'href',
      '/secured/assignments/asg-1',
    )
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
    expect(screen.queryByText('Submitted')).not.toBeInTheDocument()
    expect(screen.queryByText('Not submitted')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /attachments/i })).not.toBeInTheDocument()
  })

  it('shows admin actions, submission chip, and attachments when present', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const assignment = makeAssignment({
      mySubmissionStatus: 'submitted',
      attachments: 'https://example.com/brief.pdf',
    })

    render(
      <AssignmentCard
        assignment={assignment}
        isAdmin
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    )

    expect(screen.getByText('Submitted')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /attachments/i })).toHaveAttribute(
      'href',
      'https://example.com/brief.pdf',
    )

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onEdit).toHaveBeenCalledWith(assignment)
    expect(onDelete).toHaveBeenCalledWith(assignment)
  })

  it('does not render admin buttons when callbacks are omitted', () => {
    render(<AssignmentCard assignment={makeAssignment()} isAdmin />)

    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })
})
