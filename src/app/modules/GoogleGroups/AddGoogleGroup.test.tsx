import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AddGoogleGroup } from './AddGoogleGroup'

const {
  createGroupMock,
  updateGroupMock,
  successToastMock,
} = vi.hoisted(() => ({
  createGroupMock: vi.fn(),
  updateGroupMock: vi.fn(),
  successToastMock: vi.fn(),
}))

vi.mock('@/hooks/useGoogleGroups', () => ({
  useGoogleGroups: () => ({
    createGroup: createGroupMock,
    updateGroup: updateGroupMock,
    refetch: vi.fn(),
  }),
}))

vi.mock('goey-toast', () => ({
  gooeyToast: { success: successToastMock, error: vi.fn() },
}))
vi.mock('@/ui/organisms/modal/Modal', () => {
  const Root = ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? <section>{children}</section> : null
  const Slot = ({ children }: { children: ReactNode }) => <>{children}</>
  return { Modal: Object.assign(Root, { Title: Slot, Body: Slot, Footer: Slot }) }
})

function getEmailInput() {
  return document.getElementById('group-email') as HTMLInputElement
}

afterEach(() => {
  cleanup()
})

describe('AddGoogleGroup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createGroupMock.mockResolvedValue(undefined)
    updateGroupMock.mockResolvedValue(undefined)
  })

  it('ignores whitespace-only name or email', async () => {
    const user = userEvent.setup()
    const onSucess = vi.fn()

    render(
      <AddGoogleGroup show groupToEdit={undefined} onSucess={onSucess} />,
    )

    await user.type(screen.getByPlaceholderText('e.g. Frontend Team'), '   ')
    await user.type(getEmailInput(), '   ')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(createGroupMock).not.toHaveBeenCalled()
    expect(updateGroupMock).not.toHaveBeenCalled()
    expect(successToastMock).not.toHaveBeenCalled()
    expect(onSucess).not.toHaveBeenCalled()
  })

  it('creates a trimmed group and updates when an id is present', async () => {
    const user = userEvent.setup()
    const onSucess = vi.fn()

    const { rerender } = render(
      <AddGoogleGroup show groupToEdit={undefined} onSucess={onSucess} />,
    )

    await user.type(
      screen.getByPlaceholderText('e.g. Frontend Team'),
      '  Frontend Team  ',
    )
    await user.type(getEmailInput(), '  frontend@mentorbridge.in  ')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(createGroupMock).toHaveBeenCalledTimes(1))
    expect(createGroupMock).toHaveBeenCalledWith({
      name: 'Frontend Team',
      email: 'frontend@mentorbridge.in',
    })
    expect(updateGroupMock).not.toHaveBeenCalled()
    expect(onSucess).toHaveBeenCalledTimes(1)

    rerender(
      <AddGoogleGroup
        show
        groupToEdit={{
          id: 'grp-1',
          name: 'Frontend Team',
          email: 'frontend@mentorbridge.in',
        }}
        onSucess={onSucess}
      />,
    )

    await waitFor(() =>
      expect(screen.getByPlaceholderText('e.g. Frontend Team')).toHaveValue(
        'Frontend Team',
      ),
    )
    await user.clear(getEmailInput())
    await user.type(getEmailInput(), '  alumni@mentorbridge.in  ')
    await user.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() => expect(updateGroupMock).toHaveBeenCalledTimes(1))
    expect(updateGroupMock).toHaveBeenCalledWith('grp-1', {
      name: 'Frontend Team',
      email: 'alumni@mentorbridge.in',
    })
    expect(createGroupMock).toHaveBeenCalledTimes(1)
    expect(onSucess).toHaveBeenCalledTimes(2)
  })
})
