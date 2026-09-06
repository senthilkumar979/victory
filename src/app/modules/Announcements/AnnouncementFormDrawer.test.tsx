import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AnnouncementFormDrawer } from './AnnouncementFormDrawer'

const {
  createAnnouncementMock,
  updateAnnouncementMock,
  sendEmailMock,
  ensureSubscriptionMock,
  requestPermissionMock,
  notifyMock,
  successToastMock,
} = vi.hoisted(() => ({
  createAnnouncementMock: vi.fn(),
  updateAnnouncementMock: vi.fn(),
  sendEmailMock: vi.fn(),
  ensureSubscriptionMock: vi.fn(),
  requestPermissionMock: vi.fn(),
  notifyMock: vi.fn(),
  successToastMock: vi.fn(),
}))

vi.mock('@/hooks/useAnnouncements', () => ({
  useAnnouncements: () => ({
    createAnnouncement: createAnnouncementMock,
    updateAnnouncement: updateAnnouncementMock,
  }),
}))

vi.mock('@/hooks/useTriggerEmailOnAnnouncement', () => ({
  useTriggerEmailOnAnnouncement: () => ({
    triggerEmailOnAnnouncement: sendEmailMock,
  }),
}))

vi.mock('@/hooks/usePushSubscription', () => ({
  usePushSubscription: () => ({
    ensureSubscription: ensureSubscriptionMock,
  }),
}))

vi.mock('@/hooks/useWebNotification', () => ({
  useWebNotification: () => ({
    isSupported: true,
    requestPermission: requestPermissionMock,
    notify: notifyMock,
  }),
}))

vi.mock('goey-toast', () => ({
  gooeyToast: {
    success: successToastMock,
    error: vi.fn(),
  },
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

vi.mock('@/organisms/rich-text-editor', () => ({
  RichTextEditor: ({
    value,
    handleChange,
    placeholder,
  }: {
    value: string
    handleChange: (value: string) => void
    placeholder?: string
  }) => (
    <textarea
      aria-label="Description"
      placeholder={placeholder}
      value={value}
      onChange={(event) => handleChange(event.target.value)}
    />
  ),
}))

afterEach(() => {
  cleanup()
})

describe('AnnouncementFormDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createAnnouncementMock.mockResolvedValue(undefined)
    updateAnnouncementMock.mockResolvedValue(undefined)
    ensureSubscriptionMock.mockResolvedValue(undefined)
    requestPermissionMock.mockResolvedValue('granted')
  })

  it('does not save whitespace-only title or description', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()

    render(
      <AnnouncementFormDrawer isOpen onClose={vi.fn()} onSuccess={onSuccess} />,
    )

    await user.type(
      screen.getByPlaceholderText('e.g. Scheduled maintenance on Saturday'),
      '   ',
    )
    await user.type(screen.getByLabelText('Description'), '   ')
    await user.click(screen.getByRole('button', { name: /create/i }))

    expect(createAnnouncementMock).not.toHaveBeenCalled()
    expect(updateAnnouncementMock).not.toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
    expect(successToastMock).not.toHaveBeenCalled()
  })

  it('creates, subscribes, and notifies only on the create path', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()

    render(
      <AnnouncementFormDrawer isOpen onClose={vi.fn()} onSuccess={onSuccess} />,
    )

    await user.type(
      screen.getByPlaceholderText('e.g. Scheduled maintenance on Saturday'),
      '  Campus closed  ',
    )
    await user.type(screen.getByLabelText('Description'), '  Details here  ')
    await user.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() =>
      expect(createAnnouncementMock).toHaveBeenCalledWith({
        title: 'Campus closed',
        description: 'Details here',
      }),
    )
    expect(ensureSubscriptionMock).toHaveBeenCalledTimes(1)
    expect(requestPermissionMock).toHaveBeenCalledTimes(1)
    expect(notifyMock).toHaveBeenCalledWith(
      'Important announcement | MentorBridge',
      { body: 'Campus closed' },
    )
    expect(updateAnnouncementMock).not.toHaveBeenCalled()
    expect(sendEmailMock).not.toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('updates without push subscription or local notification', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()

    render(
      <AnnouncementFormDrawer
        isOpen
        announcementToEdit={{
          id: 'ann-1',
          title: 'Old title',
          description: 'Old description',
        }}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    )

    await waitFor(() =>
      expect(
        screen.getByPlaceholderText('e.g. Scheduled maintenance on Saturday'),
      ).toHaveValue('Old title'),
    )

    await user.click(screen.getByRole('button', { name: /update/i }))

    await waitFor(() =>
      expect(updateAnnouncementMock).toHaveBeenCalledWith('ann-1', {
        title: 'Old title',
        description: 'Old description',
      }),
    )
    expect(createAnnouncementMock).not.toHaveBeenCalled()
    expect(ensureSubscriptionMock).not.toHaveBeenCalled()
    expect(notifyMock).not.toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })
})
