import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { AnnouncementFormState } from './Announcement.types'
import { AdminAnnouncement } from './AdminAnnouncement'

const { useAnnouncementsMock, refetch } = vi.hoisted(() => ({
  useAnnouncementsMock: vi.fn(),
  refetch: vi.fn(),
}))

vi.mock('@/hooks/useAnnouncements', () => ({
  useAnnouncements: () => useAnnouncementsMock(),
}))

vi.mock('./AnnouncementFormDrawer', () => ({
  AnnouncementFormDrawer: function AnnouncementFormDrawer({
    isOpen,
    announcementToEdit,
    onSuccess,
  }: {
    isOpen: boolean
    announcementToEdit?: AnnouncementFormState
    onSuccess: () => void
  }) {
    if (!isOpen) return null
    return (
      <div>
        <pre data-testid="announcement-form">
          {announcementToEdit ? JSON.stringify(announcementToEdit) : 'create'}
        </pre>
        <button type="button" onClick={onSuccess}>
          Save announcement
        </button>
      </div>
    )
  },
}))

vi.mock('./DeleteAnnouncement', () => ({
  DeleteAnnouncement: function DeleteAnnouncement({
    show,
    announcementToDelete,
    onDelete,
  }: {
    show: boolean
    announcementToDelete: AnnouncementFormState | null
    onDelete: () => void
  }) {
    if (!show) return null
    return (
      <button type="button" onClick={onDelete}>
        Confirm delete {announcementToDelete?.id}
      </button>
    )
  },
}))

const announcement: AnnouncementFormState = {
  id: 'ann-1',
  title: 'Launch day',
  description: '<p>Ships Friday</p>',
  created_at: '2026-07-01T00:00:00.000Z',
}

afterEach(() => {
  cleanup()
  refetch.mockReset()
})

describe('AdminAnnouncement', () => {
  it('shows loading, error, and empty states', () => {
    useAnnouncementsMock.mockReturnValue({
      announcements: [],
      isLoading: true,
      error: null,
      refetch,
    })
    const { rerender } = render(<AdminAnnouncement />)
    expect(screen.getByText('Loading announcements…')).toBeInTheDocument()
    expect(screen.queryByText('No announcements created yet.')).not.toBeInTheDocument()

    useAnnouncementsMock.mockReturnValue({
      announcements: [],
      isLoading: false,
      error: 'timeout',
      refetch,
    })
    rerender(<AdminAnnouncement />)
    expect(screen.getByText(/Failed to load announcements\. timeout/)).toBeInTheDocument()

    useAnnouncementsMock.mockReturnValue({
      announcements: [],
      isLoading: false,
      error: null,
      refetch,
    })
    rerender(<AdminAnnouncement />)
    expect(screen.getByText('No announcements created yet.')).toBeInTheDocument()
  })

  it('edits title and description only, then refetches after save and delete', async () => {
    const user = userEvent.setup()
    useAnnouncementsMock.mockReturnValue({
      announcements: [announcement],
      isLoading: false,
      error: null,
      refetch,
    })

    render(<AdminAnnouncement />)

    expect(screen.getByText('Ships Friday')).toBeInTheDocument()
    const row = screen.getByRole('row', { name: /Launch day/ })
    const [edit, remove] = within(row).getAllByRole('button')

    await user.click(edit)
    expect(screen.getByTestId('announcement-form')).toHaveTextContent(
      JSON.stringify({
        id: 'ann-1',
        title: 'Launch day',
        description: '<p>Ships Friday</p>',
      }),
    )

    await user.click(screen.getByRole('button', { name: 'Save announcement' }))
    expect(refetch).toHaveBeenCalledOnce()
    expect(screen.queryByTestId('announcement-form')).not.toBeInTheDocument()

    await user.click(remove)
    await user.click(screen.getByRole('button', { name: 'Confirm delete ann-1' }))
    expect(refetch).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('button', { name: /Confirm delete/ })).not.toBeInTheDocument()
  })
})
