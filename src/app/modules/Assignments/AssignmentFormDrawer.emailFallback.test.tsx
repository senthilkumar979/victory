import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AssignmentFormValues } from '@/lib/assignments/assignmentSchemas'

import { AssignmentFormDrawer } from './AssignmentFormDrawer'

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

vi.mock('@/hooks/useCohorts', () => ({
  useCohorts: () => ({ cohorts: [] }),
}))

vi.mock('@/hooks/useGoogleGroups', () => ({
  useGoogleGroups: () => ({ groups: [] }),
}))

vi.mock('@/ui/organisms/drawer/Drawer', () => {
  const DrawerRoot = ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? <section>{children}</section> : null
  const DrawerSlot = ({ children }: { children: ReactNode }) => <>{children}</>
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
  cohortId: '11111111-1111-4111-8111-111111111111',
  category: 'Frontend',
  googleGroupId: 'team@test.com',
  attachments: '',
  dueDate: '2026-06-15T10:00:00.000Z',
}

vi.mock('./AssignmentFormFields', () => ({
  AssignmentFormFields: ({
    form,
  }: {
    form: UseFormReturn<AssignmentFormValues>
  }) => (
    <button type="button" onClick={() => form.reset(validValues)}>
      Fill assignment
    </button>
  ),
}))

async function saveAssignment() {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Fill assignment' }))
  await user.click(screen.getByRole('button', { name: /save/i }))
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('AssignmentFormDrawer email fallbacks', () => {
  const fetchMock = vi.fn()
  const onSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('warns with the configuration hint when the save response omits email status', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ assignment: { id: 'asg-1' } }),
    })

    render(
      <AssignmentFormDrawer isOpen onClose={vi.fn()} onSuccess={onSuccess} />,
    )
    await saveAssignment()

    await waitFor(() =>
      expect(warningToastMock).toHaveBeenCalledWith(
        'Assignment saved, but email was not sent.',
        {
          description:
            'Check RESEND_API_KEY and Google Group email configuration.',
        },
      ),
    )
    expect(successToastMock).not.toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('maps a failed save without an error field to the generic save message', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    })

    render(
      <AssignmentFormDrawer isOpen onClose={vi.fn()} onSuccess={onSuccess} />,
    )
    await saveAssignment()

    await waitFor(() =>
      expect(errorToastMock).toHaveBeenCalledWith(
        'Failed to save assignment.',
        { description: 'Failed to save' },
      ),
    )
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('uses a retry message when save fails with a non-Error', async () => {
    fetchMock.mockRejectedValue('network down')

    render(
      <AssignmentFormDrawer isOpen onClose={vi.fn()} onSuccess={onSuccess} />,
    )
    await saveAssignment()

    await waitFor(() =>
      expect(errorToastMock).toHaveBeenCalledWith(
        'Failed to save assignment.',
        { description: 'Please try again.' },
      ),
    )
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
