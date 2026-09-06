import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MeetingFormDrawer } from './MeetingFormDrawer'
import type { MeetingFormState } from './Meeting.types'
import type { MeetingFormValues } from './meetingFormSchema'

const {
  createMeetingMock,
  updateMeetingMock,
  createMeetingWithPipelineMock,
  uploadCoverMock,
  successToastMock,
  warningToastMock,
  errorToastMock,
} = vi.hoisted(() => ({
  createMeetingMock: vi.fn(),
  updateMeetingMock: vi.fn(),
  createMeetingWithPipelineMock: vi.fn(),
  uploadCoverMock: vi.fn(),
  successToastMock: vi.fn(),
  warningToastMock: vi.fn(),
  errorToastMock: vi.fn(),
}))

vi.mock('@/hooks/useMeetings', () => ({
  useMeetings: () => ({
    createMeeting: createMeetingMock,
    updateMeeting: updateMeetingMock,
  }),
}))

vi.mock('@/hooks/useManageMeeting', () => ({
  useManageMeeting: () => ({
    createMeetingWithPipeline: createMeetingWithPipelineMock,
  }),
}))

vi.mock('./useMeetingCoverImageUpload', () => ({
  uploadMeetingCoverImage: (...args: unknown[]) => uploadCoverMock(...args),
}))

vi.mock('goey-toast', () => ({
  gooeyToast: {
    success: successToastMock,
    warning: warningToastMock,
    error: errorToastMock,
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

const validValues: MeetingFormValues = {
  title: 'Weekly sync',
  date: '2026-06-01T12:00:00.000Z',
  googleGroupId: 'g@test.com',
  description: 'Agenda and notes',
  meetingLink: '',
  coverImageUrl: '',
}

vi.mock('./MeetingFormFields', () => ({
  MeetingFormFields: ({
    form,
    onStagedCoverFileChange,
  }: {
    form: UseFormReturn<MeetingFormValues>
    onStagedCoverFileChange: (file: File | null) => void
  }) => (
    <div>
      <button type="button" onClick={() => form.reset(validValues)}>
        Fill meeting
      </button>
      <button
        type="button"
        onClick={() =>
          onStagedCoverFileChange(
            new File(['cover'], 'cover.png', { type: 'image/png' }),
          )
        }
      >
        Stage cover
      </button>
    </div>
  ),
}))

function makeMeeting(
  overrides: Partial<MeetingFormState> = {},
): MeetingFormState {
  return {
    id: 'mtg-1',
    title: 'Weekly sync',
    date: '2026-06-01T12:00:00.000Z',
    googleGroupId: 'g@test.com',
    description: 'Agenda and notes',
    meetingLink: '',
    coverImageUrl: '',
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('MeetingFormDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createMeetingWithPipelineMock.mockResolvedValue({ id: 'mtg-new' })
    updateMeetingMock.mockResolvedValue(undefined)
    uploadCoverMock.mockResolvedValue('https://cdn.example/cover.png')
  })

  it('creates via the pipeline and asks for a cover when none was provided', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()

    render(
      <MeetingFormDrawer isOpen onClose={vi.fn()} onSuccess={onSuccess} />,
    )

    await user.click(screen.getByRole('button', { name: 'Fill meeting' }))
    await user.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() =>
      expect(createMeetingWithPipelineMock).toHaveBeenCalledTimes(1),
    )
    expect(updateMeetingMock).not.toHaveBeenCalled()
    expect(uploadCoverMock).not.toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalledWith({
      meetingId: 'mtg-new',
      suggestCoverImage: true,
    })
    expect(errorToastMock).not.toHaveBeenCalled()
  })

  it('still finishes create when the staged cover upload fails', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    uploadCoverMock.mockRejectedValueOnce(new Error('blob unavailable'))

    render(
      <MeetingFormDrawer isOpen onClose={vi.fn()} onSuccess={onSuccess} />,
    )

    await user.click(screen.getByRole('button', { name: 'Fill meeting' }))
    await user.click(screen.getByRole('button', { name: 'Stage cover' }))
    await user.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() =>
      expect(warningToastMock).toHaveBeenCalledWith(
        'Meeting created but cover image upload failed.',
        expect.objectContaining({ description: 'blob unavailable' }),
      ),
    )
    expect(createMeetingWithPipelineMock).toHaveBeenCalledTimes(1)
    expect(uploadCoverMock).toHaveBeenCalledWith(
      'mtg-new',
      expect.any(File),
    )
    expect(onSuccess).toHaveBeenCalledWith({
      meetingId: 'mtg-new',
      suggestCoverImage: true,
    })
    expect(errorToastMock).not.toHaveBeenCalled()
  })

  it('uploads a staged cover on edit before saving the meeting', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()

    render(
      <MeetingFormDrawer
        isOpen
        meetingToEdit={makeMeeting()}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Stage cover' }))
    await user.click(screen.getByRole('button', { name: /update/i }))

    await waitFor(() =>
      expect(updateMeetingMock).toHaveBeenCalledWith(
        'mtg-1',
        expect.objectContaining({
          coverImageUrl: 'https://cdn.example/cover.png',
        }),
      ),
    )
    expect(uploadCoverMock).toHaveBeenCalledWith('mtg-1', expect.any(File))
    expect(createMeetingWithPipelineMock).not.toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalledWith({ meetingId: 'mtg-1' })
  })

  it('toasts edit failures and does not call onSuccess', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    updateMeetingMock.mockRejectedValueOnce(new Error('calendar denied'))

    render(
      <MeetingFormDrawer
        isOpen
        meetingToEdit={makeMeeting()}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    )

    await user.click(screen.getByRole('button', { name: /update/i }))

    await waitFor(() =>
      expect(errorToastMock).toHaveBeenCalledWith(
        'Failed to save meeting.',
        expect.objectContaining({ description: 'calendar denied' }),
      ),
    )
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
