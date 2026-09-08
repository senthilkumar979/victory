import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { GoogleGroupFormState } from './GoogleGroup.types'
import { DeleteGoogleGroup } from './DeleteGoogleGroup'

const { deleteGroupMock, successToastMock } = vi.hoisted(() => ({
  deleteGroupMock: vi.fn(),
  successToastMock: vi.fn(),
}))

vi.mock('@/hooks/useGoogleGroups', () => ({
  useGoogleGroups: () => ({ deleteGroup: deleteGroupMock }),
}))
vi.mock('goey-toast', () => ({
  gooeyToast: { success: successToastMock, error: vi.fn() },
}))
vi.mock('@/ui/organisms/modal/Modal', () => {
  const Root = ({
    isOpen,
    children,
  }: {
    isOpen: boolean
    children: ReactNode
  }) => (isOpen ? <section>{children}</section> : null)
  const Slot = ({ children }: { children: ReactNode }) => <>{children}</>
  return { Modal: Object.assign(Root, { Title: Slot, Body: Slot, Footer: Slot }) }
})

function makeGroup(
  overrides: Partial<GoogleGroupFormState> = {},
): GoogleGroupFormState {
  return {
    id: 'grp-1',
    name: 'Cohort A',
    email: 'cohort-a@mentorbridge.in',
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('DeleteGoogleGroup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    deleteGroupMock.mockResolvedValue(undefined)
  })

  it('does not delete when the group has no id', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(
      <DeleteGoogleGroup
        show
        groupToDelete={makeGroup({ id: undefined })}
        onDelete={onDelete}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(deleteGroupMock).not.toHaveBeenCalled()
    expect(successToastMock).not.toHaveBeenCalled()
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('deletes by id and notifies the parent', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(
      <DeleteGoogleGroup
        show
        groupToDelete={makeGroup()}
        onDelete={onDelete}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(deleteGroupMock).toHaveBeenCalledWith('grp-1'))
    expect(successToastMock).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})
