import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { AssignmentFormState, AssignmentListItem } from '@/types/assignment.types'

import { AssignmentsList } from './AssignmentsList'

const { useAssignmentsMock } = vi.hoisted(() => ({
  useAssignmentsMock: vi.fn(),
}))

vi.mock('@/hooks/useAssignments', () => ({
  useAssignments: () => useAssignmentsMock(),
}))

vi.mock('next/link', () => ({
  default: function NextLink({
    href,
    children,
    ...props
  }: {
    href: string
    children: ReactNode
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  },
}))

vi.mock('./AssignmentFormDrawer', () => ({
  AssignmentFormDrawer: function AssignmentFormDrawer({
    isOpen,
    assignmentToEdit,
  }: {
    isOpen: boolean
    assignmentToEdit?: AssignmentFormState
  }) {
    if (!isOpen) return null
    return (
      <pre data-testid="assignment-form">
        {assignmentToEdit ? JSON.stringify(assignmentToEdit) : 'create'}
      </pre>
    )
  },
}))

vi.mock('./DeleteAssignment', () => ({
  DeleteAssignment: function DeleteAssignment({
    show,
    assignment,
  }: {
    show: boolean
    assignment: AssignmentListItem | null
  }) {
    if (!show || !assignment) return null
    return <div data-testid="delete-assignment">{assignment.id}</div>
  },
}))

const assignment: AssignmentListItem = {
  id: 'asg-1',
  title: 'Build a parser',
  description: 'Parse emails',
  cohortId: 'cohort-1',
  cohortName: 'Batch 12',
  category: 'Backend',
  googleGroupId: 'group-1',
  attachments: null,
  dueDate: '2026-08-01T10:00:00.000Z',
  createdBy: 'admin',
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-01T00:00:00.000Z',
  dueStatus: 'upcoming',
  stats: {
    totalStudents: 4,
    submittedCount: 1,
    pendingCount: 3,
    submissionPercentage: 25,
  },
}

function mockAssignments(overrides?: {
  isAdmin?: boolean
  isLoading?: boolean
  error?: string | null
  assignments?: AssignmentListItem[]
}) {
  useAssignmentsMock.mockReturnValue({
    assignments: overrides?.assignments ?? [assignment],
    isAdmin: overrides?.isAdmin ?? false,
    isLoading: overrides?.isLoading ?? false,
    error: overrides?.error ?? null,
    refetch: vi.fn(),
  })
}

afterEach(() => {
  cleanup()
})

describe('AssignmentsList', () => {
  it('hides create, edit, and delete from members', () => {
    mockAssignments({ isAdmin: false })

    render(<AssignmentsList />)

    expect(screen.getByText('View and submit cohort assignments.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Create Assignment/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open Assignment' })).toHaveAttribute(
      'href',
      '/secured/assignments/asg-1',
    )
  })

  it('shows admin actions from the settings panel even when the viewer is not an admin', async () => {
    const user = userEvent.setup()
    mockAssignments({ isAdmin: false })

    render(<AssignmentsList adminPanel />)

    expect(screen.getByText('Create and manage cohort assignments.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    expect(screen.getByTestId('assignment-form')).toHaveTextContent(
      JSON.stringify({
        id: 'asg-1',
        title: 'Build a parser',
        description: 'Parse emails',
        cohortId: 'cohort-1',
        category: 'Backend',
        googleGroupId: 'group-1',
        attachments: '',
        dueDate: '2026-08-01T10:00:00.000Z',
      }),
    )

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByTestId('delete-assignment')).toHaveTextContent('asg-1')
  })

  it('shows loading, error, and empty states without the empty copy', () => {
    mockAssignments({ isLoading: true, assignments: [] })
    const { rerender, container } = render(<AssignmentsList />)

    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3)
    expect(screen.queryByText('No assignments yet.')).not.toBeInTheDocument()

    mockAssignments({ error: 'Cohort lookup failed', assignments: [] })
    rerender(<AssignmentsList />)
    expect(screen.getByText('Cohort lookup failed')).toBeInTheDocument()
    expect(screen.queryByText('No assignments yet.')).not.toBeInTheDocument()

    mockAssignments({ assignments: [] })
    rerender(<AssignmentsList />)
    expect(screen.getByText('No assignments yet.')).toBeInTheDocument()
  })
})
