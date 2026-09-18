import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { MeetingFormState } from './Meeting.types'
import { AdminMeetings } from './AdminMeetings'

const toast = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}))

const hookState = {
  meetings: [] as MeetingFormState[],
  isLoading: false,
  error: null as string | null,
  refetch: vi.fn(),
}

vi.mock('goey-toast', () => ({
  gooeyToast: toast,
}))

vi.mock('@/hooks/useMeetings', () => ({
  useMeetings: () => hookState,
}))

vi.mock('./MeetingsHeader', () => ({
  MeetingsHeader: () => <div>header</div>,
}))

vi.mock('./MeetingsListStates', () => ({
  MeetingsListStates: () => null,
}))

vi.mock('./MeetingsTable', () => ({
  MeetingsTable: function MeetingsTableMock({
    meetings,
    onPublishToLinkedIn,
  }: {
    meetings: MeetingFormState[]
    onPublishToLinkedIn: (meeting: MeetingFormState) => void
  }) {
    return (
      <div>
        {meetings.map((meeting) => (
          <button
            key={meeting.id ?? meeting.title}
            type="button"
            onClick={() => onPublishToLinkedIn(meeting)}
          >
            Publish {meeting.title}
          </button>
        ))}
      </div>
    )
  },
}))

vi.mock('./MeetingFormDrawer', () => ({
  MeetingFormDrawer: () => null,
}))

vi.mock('./MeetingCoverImageDrawer', () => ({
  MeetingCoverImageDrawer: () => null,
}))

vi.mock('./DeleteMeeting', () => ({
  DeleteMeeting: () => null,
}))

vi.mock('./AttendanceTrackerDrawer', () => ({
  AttendanceTrackerDrawer: () => null,
}))

vi.mock('@/components/linkedin', () => ({
  LinkedInPublishDrawer: function LinkedInPublishDrawerMock({
    isOpen,
    contextTitle,
  }: {
    isOpen: boolean
    contextTitle: string
  }) {
    if (!isOpen) return null
    return <div>linkedin-drawer:{contextTitle}</div>
  },
}))

const readyMeeting: MeetingFormState = {
  id: 'mtg-ready',
  title: 'Demo day',
  date: '2026-09-17T10:00:00.000Z',
  googleGroupId: 'g@test.com',
  description: 'Ship it',
  meetingLink: 'https://meet.example/demo',
  coverImageUrl: 'https://cdn.example/cover.jpg',
}

beforeEach(() => {
  hookState.meetings = []
  hookState.isLoading = false
  hookState.error = null
  hookState.refetch.mockReset()
  toast.error.mockReset()
  toast.success.mockReset()
})

afterEach(() => {
  cleanup()
})

describe('AdminMeetings', () => {
  it('blocks LinkedIn publish without a cover image and does not open the drawer', async () => {
    const user = userEvent.setup()
    hookState.meetings = [{ ...readyMeeting, coverImageUrl: '   ' }]

    render(<AdminMeetings />)
    await user.click(screen.getByRole('button', { name: 'Publish Demo day' }))

    expect(toast.error).toHaveBeenCalledWith(
      'Cover image is required. Generate a cover image for this meeting first.',
      expect.objectContaining({ description: 'Demo day' }),
    )
    expect(screen.queryByText('linkedin-drawer:Demo day')).not.toBeInTheDocument()
  })

  it('blocks LinkedIn publish without a meeting link after a cover exists', async () => {
    const user = userEvent.setup()
    hookState.meetings = [{ ...readyMeeting, meetingLink: '   ' }]

    render(<AdminMeetings />)
    await user.click(screen.getByRole('button', { name: 'Publish Demo day' }))

    expect(toast.error).toHaveBeenCalledWith(
      'Add a meeting link before publishing to LinkedIn.',
      expect.objectContaining({ description: 'Demo day' }),
    )
    expect(screen.queryByText('linkedin-drawer:Demo day')).not.toBeInTheDocument()
  })

  it('opens the LinkedIn drawer when cover and meeting link are present', async () => {
    const user = userEvent.setup()
    hookState.meetings = [readyMeeting]

    render(<AdminMeetings />)
    await user.click(screen.getByRole('button', { name: 'Publish Demo day' }))

    expect(toast.error).not.toHaveBeenCalled()
    expect(screen.getByText('linkedin-drawer:Demo day')).toBeInTheDocument()
  })
})
