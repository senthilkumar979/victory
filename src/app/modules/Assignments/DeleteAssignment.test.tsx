import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AssignmentListItem } from '@/types/assignment.types'

import { DeleteAssignment } from './DeleteAssignment'

const { successToastMock, errorToastMock } = vi.hoisted(() => ({
  successToastMock: vi.fn(),
  errorToastMock: vi.fn(),
}))

vi.mock('goey-toast', () => ({
  gooeyToast: { success: successToastMock, error: errorToastMock },
}))

function makeAssignment(
  overrides: Partial<AssignmentListItem> = {},
): AssignmentListItem {
  return {
    id: 'asg-1',
    title: 'Build a REST API',
    description: 'Week 3 assignment',
    cohortId: 'cohort-1',
    category: 'Backend',
    googleGroupId: 'team@test.com',
    attachments: null,
    dueDate: '2026-06-15T10:00:00.000Z',
    createdBy: 'admin-1',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    stats: {
      totalStudents: 10,
      submittedCount: 4,
      pendingCount: 6,
      submissionPercentage: 40,
    },
    dueStatus: 'upcoming',
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('DeleteAssignment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      }),
    )
  })

  it('renders nothing when hidden or the assignment is missing', () => {
    const { container: hidden } = render(
      <DeleteAssignment
        show={false}
        assignment={makeAssignment()}
        onClose={vi.fn()}
        onDeleted={vi.fn()}
      />,
    )
    expect(hidden).toBeEmptyDOMElement()

    cleanup()

    const { container: missing } = render(
      <DeleteAssignment
        show
        assignment={null}
        onClose={vi.fn()}
        onDeleted={vi.fn()}
      />,
    )
    expect(missing).toBeEmptyDOMElement()
  })

  it('deletes by assignment id and notifies the parent', async () => {
    const user = userEvent.setup()
    const onDeleted = vi.fn()
    const onClose = vi.fn()

    render(
      <DeleteAssignment
        show
        assignment={makeAssignment()}
        onClose={onClose}
        onDeleted={onDeleted}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith('/api/assignments/asg-1', {
        method: 'DELETE',
      }),
    )
    expect(successToastMock).toHaveBeenCalledTimes(1)
    expect(onDeleted).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('surfaces API body.error and falls back when the payload has no error', async () => {
    const user = userEvent.setup()
    const onDeleted = vi.fn()

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Still has submissions' }),
    } as Response)

    render(
      <DeleteAssignment
        show
        assignment={makeAssignment()}
        onClose={vi.fn()}
        onDeleted={onDeleted}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(errorToastMock).toHaveBeenCalledWith(
        'Failed to delete assignment.',
        expect.objectContaining({ description: 'Still has submissions' }),
      ),
    )
    expect(onDeleted).not.toHaveBeenCalled()

    cleanup()
    errorToastMock.mockClear()

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response)

    render(
      <DeleteAssignment
        show
        assignment={makeAssignment({ id: 'asg-2' })}
        onClose={vi.fn()}
        onDeleted={onDeleted}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(errorToastMock).toHaveBeenCalledWith(
        'Failed to delete assignment.',
        expect.objectContaining({ description: 'Delete failed' }),
      ),
    )
    expect(onDeleted).not.toHaveBeenCalled()
  })

  it('omits the error description when the reject is not an Error', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockRejectedValueOnce('network down')

    render(
      <DeleteAssignment
        show
        assignment={makeAssignment()}
        onClose={vi.fn()}
        onDeleted={vi.fn()}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(errorToastMock).toHaveBeenCalledWith(
        'Failed to delete assignment.',
        expect.objectContaining({ description: undefined }),
      ),
    )
  })
})
