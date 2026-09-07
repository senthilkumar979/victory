import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DeleteAnnouncement } from './DeleteAnnouncement'

const { deleteAnnouncementMock, successToastMock } = vi.hoisted(() => ({
  deleteAnnouncementMock: vi.fn(),
  successToastMock: vi.fn(),
}))

vi.mock('@/hooks/useAnnouncements', () => ({
  useAnnouncements: () => ({
    deleteAnnouncement: deleteAnnouncementMock,
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

afterEach(() => {
  cleanup()
})

describe('DeleteAnnouncement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    deleteAnnouncementMock.mockResolvedValue(undefined)
  })

  it('does not delete when the announcement has no id', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(
      <DeleteAnnouncement
        show
        announcementToDelete={{ title: 'Town hall', description: 'All hands' }}
        onDelete={onDelete}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(deleteAnnouncementMock).not.toHaveBeenCalled()
    expect(successToastMock).not.toHaveBeenCalled()
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('deletes by id and notifies the parent', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(
      <DeleteAnnouncement
        show
        announcementToDelete={{
          id: 'ann-1',
          title: 'Town hall',
          description: 'All hands',
        }}
        onDelete={onDelete}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(deleteAnnouncementMock).toHaveBeenCalledWith('ann-1'),
    )
    expect(successToastMock).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})
