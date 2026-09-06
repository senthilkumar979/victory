import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AssignmentFormValues } from '@/lib/assignments/assignmentSchemas'

import { AssignmentFormDrawer } from './AssignmentFormDrawer'
import type { AssignmentFormState } from '@/types/assignment.types'

const { successToastMock, warningToastMock, errorToastMock } = vi.hoisted(
  () => ({
    successToastMock: vi.fn(),
    warningToastMock: vi.fn(),
    errorToastMock: vi.fn(),
  }),
)

vi.mock('goey-toast', () => ({
  gooeyToast: {
    success: successToastMock,
    warning: warningToastMock,
    error: errorToastMock,
  },
}))

const cohortId = '11111111-1111-4111-8111-111111111111'
const groupId = '22222222-2222-4222-8222-222222222222'

vi.mock('@/hooks/useCohorts', () => ({
  useCohorts: () => ({
    cohorts: [{ id: cohortId, name: 'Cohort A' }],
  }),
}))

vi.mock('@/hooks/useGoogleGroups', () => ({
  useGoogleGroups: () => ({
    groups: [{ id: groupId, name: 'Team', email: 'team@test.com' }],
  }),
}))

interface DrawerSlotProps {
  children: ReactNode
}

vi.mock('@/ui/organisms/drawer/Drawer', () => {
  const DrawerRoot = ({
    isOpen,
    children,
  }: {
    isOpen: boolean
    children: ReactNode
  }) => (isOpen ? <section>{children}</section> : null)
  const DrawerSlot = ({ children }: DrawerSlotProps) => <>{children}</>

  return {
    Drawer: Object.assign(DrawerRoot, {
      Title: DrawerSlot,
      Body: DrawerSlot,
      Footer: DrawerSlot,
    }),
  }
})

const validValues: AssignmentFormValues = {
  title: 'Week 3 homework',
  description: 'Build the form',
  cohortId,
  category: 'Frontend',
  googleGroupId: groupId,
  attachments: '',
  dueDate: '2026-06-15T10:00:00.000Z',
}

vi.mock('./AssignmentFormFields', () => ({
  AssignmentFormFields: ({
    form,
  }: {
    form: UseFormReturn<AssignmentFormValues>
  }) => (
    <div>
      <button type="button" onClick={() => form.reset(validValues)}>
        Fill assignment
      </button>
      <span data-testid="group-id">{form.watch('googleGroupId')}</span>
    </div>
  ),
}))

function makeAssignment(
  overrides: Partial<AssignmentFormState> = {},
): AssignmentFormState {
  return {
    id: 'asg-1',
    title: 'Existing homework',
    description: 'Update me',
    cohortId,
    category: 'Frontend',
    googleGroupId: 'team@test.com',
    attachments: '',
    dueDate: '2026-06-20T10:00:00.000Z',
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('AssignmentFormDrawer', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('POSTs a new assignment and remaps a group id to email', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ emailSent: true }),
    })

    render(
      <AssignmentFormDrawer isOpen onClose={vi.fn()} onSuccess={onSuccess} />,
    )

    await user.click(screen.getByRole('button', { name: 'Fill assignment' }))
    await waitFor(() =>
      expect(screen.getByTestId('group-id')).toHaveTextContent('team@test.com'),
    )
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/assignments',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          ...validValues,
          googleGroupId: 'team@test.com',
        }),
      }),
    )
    expect(successToastMock).toHaveBeenCalledWith(
      'Assignment saved and group notified by email.',
    )
    expect(warningToastMock).not.toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('warns when the assignment is saved but email is not sent', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        emailSent: false,
        emailWarning: 'RESEND_API_KEY is missing',
      }),
    })

    render(
      <AssignmentFormDrawer isOpen onClose={vi.fn()} onSuccess={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: 'Fill assignment' }))
    await waitFor(() =>
      expect(screen.getByTestId('group-id')).toHaveTextContent('team@test.com'),
    )
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() =>
      expect(warningToastMock).toHaveBeenCalledWith(
        'Assignment saved, but email was not sent.',
        expect.objectContaining({
          description: 'RESEND_API_KEY is missing',
        }),
      ),
    )
    expect(successToastMock).not.toHaveBeenCalled()
  })

  it('PATCHes an existing assignment and maps API errors', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Due date is in the past' }),
    })

    render(
      <AssignmentFormDrawer
        isOpen
        assignmentToEdit={makeAssignment()}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    )

    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/assignments/asg-1',
        expect.objectContaining({ method: 'PATCH' }),
      ),
    )
    expect(errorToastMock).toHaveBeenCalledWith(
      'Failed to save assignment.',
      expect.objectContaining({ description: 'Due date is in the past' }),
    )
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
