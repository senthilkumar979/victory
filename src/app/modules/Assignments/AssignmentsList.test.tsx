import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AssignmentListItem } from '@/types/assignment.types'

import { AssignmentsList } from './AssignmentsList'

const hookState = {
  assignments: [] as AssignmentListItem[],
  isAdmin: false,
  isLoading: false,
  error: null as string | null,
  refetch: vi.fn(),
}

vi.mock('@/hooks/useAssignments', () => ({
  useAssignments: () => hookState,
}))

vi.mock('./AssignmentCard', () => ({
  AssignmentCard: ({
    assignment,
    isAdmin,
    onEdit,
    onDelete,
  }: {
    assignment: AssignmentListItem
    isAdmin: boolean
    onEdit?: (assignment: AssignmentListItem) => void
    onDelete?: (assignment: AssignmentListItem) => void
  }) => (
    <div>
      <p>{assignment.title}</p>
      {isAdmin && onEdit ? (
        <button type="button" onClick={() => onEdit(assignment)}>
          Edit {assignment.title}
        </button>
      ) : null}
      {isAdmin && onDelete ? (
        <button type="button" onClick={() => onDelete(assignment)}>
          Delete {assignment.title}
        </button>
      ) : null}
    </div>
  ),
}))

vi.mock('./AssignmentFormDrawer', () => ({
  AssignmentFormDrawer: ({
    isOpen,
    assignmentToEdit,
    onSuccess,
  }: {
    isOpen: boolean
    assignmentToEdit?: { id?: string; category: string; googleGroupId: string }
    onSuccess: () => void
  }) =>
    isOpen ? (
      <div>
        <p>form-mode:{assignmentToEdit?.id ?? 'create'}</p>
        <p>form-category:{assignmentToEdit?.category ?? ''}</p>
        <p>form-group:{assignmentToEdit?.googleGroupId ?? ''}</p>
        <button type="button" onClick={onSuccess}>
          Complete save
        </button>
      </div>
    ) : null,
}))

vi.mock('./DeleteAssignment', () => ({
  DeleteAssignment: ({
    show,
    assignment,
    onDeleted,
  }: {
    show: boolean
    assignment: AssignmentListItem | null
    onDeleted: () => void
  }) =>
    show ? (
      <div>
        <p>delete:{assignment?.title ?? 'none'}</p>
        <button type="button" onClick={onDeleted}>
          Confirm delete
        </button>
      </div>
    ) : null,
}))

const assignment: AssignmentListItem = {
  id: 'asg-1',
  title: 'Build the API',
  description: 'Ship the endpoint',
  cohortId: 'cohort-1',
  cohortName: 'C1',
  category: 'Backend',
  googleGroupId: 'backend@mentorbridge.in',
  attachments: '',
  dueDate: '2026-06-15T10:00:00.000Z',
  createdBy: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  stats: {
    totalStudents: 10,
    submittedCount: 2,
    pendingCount: 8,
    submissionPercentage: 20,
  },
  dueStatus: 'upcoming',
}

beforeEach(() => {
  hookState.assignments = []
  hookState.isAdmin = false
  hookState.isLoading = false
  hookState.error = null
  hookState.refetch.mockReset()
})

afterEach(() => {
  cleanup()
})

describe('AssignmentsList', () => {
  it('hides create and card actions for members', () => {
    hookState.assignments = [assignment]
    render(<AssignmentsList />)

    expect(
      screen.queryByRole('button', { name: /Create Assignment/i }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Edit / })).not.toBeInTheDocument()
    expect(screen.getByText('View and submit cohort assignments.')).toBeInTheDocument()
  })

  it('shows admin CRUD when adminPanel is set even if the hook is not admin', async () => {
    const user = userEvent.setup()
    hookState.isAdmin = false
    hookState.assignments = [assignment]
    render(<AssignmentsList adminPanel />)

    expect(
      screen.getByText('Create and manage cohort assignments.'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Create Assignment/i }))
    expect(screen.getByText('form-mode:create')).toBeInTheDocument()
  })

  it('maps edit fields including category and google group, then refetches on save', async () => {
    const user = userEvent.setup()
    hookState.isAdmin = true
    hookState.assignments = [assignment]
    render(<AssignmentsList />)

    await user.click(screen.getByRole('button', { name: 'Edit Build the API' }))

    expect(screen.getByText('form-mode:asg-1')).toBeInTheDocument()
    expect(screen.getByText('form-category:Backend')).toBeInTheDocument()
    expect(
      screen.getByText('form-group:backend@mentorbridge.in'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Complete save' }))
    expect(hookState.refetch).toHaveBeenCalled()
    expect(screen.queryByText('form-mode:asg-1')).not.toBeInTheDocument()
  })

  it('opens delete with the selected assignment and refetches after confirm', async () => {
    const user = userEvent.setup()
    hookState.isAdmin = true
    hookState.assignments = [assignment]
    render(<AssignmentsList />)

    await user.click(screen.getByRole('button', { name: 'Delete Build the API' }))
    expect(screen.getByText('delete:Build the API')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Confirm delete' }))
    expect(hookState.refetch).toHaveBeenCalled()
    expect(screen.queryByText('delete:Build the API')).not.toBeInTheDocument()
  })

  it('shows error copy instead of the empty state', () => {
    hookState.error = 'Failed to load assignments'
    render(<AssignmentsList />)

    expect(screen.getByText('Failed to load assignments')).toBeInTheDocument()
    expect(screen.queryByText('No assignments yet.')).not.toBeInTheDocument()
  })
})
