import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { MeetingFormState } from './Meeting.types'
import { DeleteMeeting } from './DeleteMeeting'

const { deleteMeetingMock, successToastMock } = vi.hoisted(() => ({
  deleteMeetingMock: vi.fn(),
  successToastMock: vi.fn(),
}))

vi.mock('@/hooks/useMeetings', () => ({
  useMeetings: () => ({ deleteMeeting: deleteMeetingMock }),
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

function makeMeeting(overrides: Partial<MeetingFormState> = {}): MeetingFormState {
  return {
    id: 'mtg-1',
    title: 'Weekly standup',
    date: '2026-06-01T00:00:00+05:30',
    googleGroupId: 'grp-1',
    description: '',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    coverImageUrl: '',
    ...overrides,
  }
}

async function confirmDelete(meeting: MeetingFormState | null) {
  const onDeleted = vi.fn()
  render(
    <DeleteMeeting
      show
      meetingToDelete={meeting}
      onClose={vi.fn()}
      onDeleted={onDeleted}
    />,
  )
  await userEvent.setup().click(screen.getByRole('button', { name: 'Delete' }))
  return onDeleted
}

afterEach(() => {
  cleanup()
})

describe('DeleteMeeting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    deleteMeetingMock.mockResolvedValue(undefined)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
    )
  })

  it('does nothing when the meeting has no id', async () => {
    const onDeleted = await confirmDelete(makeMeeting({ id: undefined }))
    expect(fetch).not.toHaveBeenCalled()
    expect(deleteMeetingMock).not.toHaveBeenCalled()
    expect(onDeleted).not.toHaveBeenCalled()
  })

  it('removes a Google Meet calendar event then deletes the meeting', async () => {
    const meeting = makeMeeting()
    const onDeleted = await confirmDelete(meeting)

    await waitFor(() => expect(deleteMeetingMock).toHaveBeenCalledWith('mtg-1'))
    expect(fetch).toHaveBeenCalledWith(
      '/api/calendar/delete-by-meet-link',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          meetingLink: meeting.meetingLink,
          date: meeting.date,
        }),
      }),
    )
    expect(onDeleted).toHaveBeenCalledTimes(1)
    expect(successToastMock).toHaveBeenCalledTimes(1)
  })

  it('still deletes when calendar cleanup fails or the link is not Meet', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('calendar down'))
    const onDeleted = await confirmDelete(makeMeeting())
    await waitFor(() => expect(deleteMeetingMock).toHaveBeenCalledWith('mtg-1'))
    expect(onDeleted).toHaveBeenCalledTimes(1)

    cleanup()
    deleteMeetingMock.mockClear()
    const zoomDeleted = await confirmDelete(
      makeMeeting({ id: 'mtg-2', meetingLink: 'https://zoom.us/j/123' }),
    )
    await waitFor(() => expect(deleteMeetingMock).toHaveBeenCalledWith('mtg-2'))
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(zoomDeleted).toHaveBeenCalledTimes(1)
  })
})
