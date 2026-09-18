import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { MeetingFormState } from './Meeting.types'
import { MeetingsListView } from './MeetingsListView'

const firstPageMeeting: MeetingFormState = {
  id: 'mtg-1',
  title: 'Weekly standup',
  date: '2026-09-17T10:00:00.000Z',
  googleGroupId: 'g@test.com',
  description: 'Sync',
  meetingLink: 'https://meet.example/standup',
  coverImageUrl: 'https://cdn.example/cover.jpg',
}

const hookState = {
  byPage: {
    1: { meetings: [] as MeetingFormState[], totalCount: 0 },
    2: { meetings: [] as MeetingFormState[], totalCount: 0 },
  },
  isLoading: false,
  error: null as string | null,
}

vi.mock('@/hooks/useMeetings', () => ({
  useMeetings: ({ page }: { page: number }) => {
    const bucket = hookState.byPage[page as 1 | 2] ?? hookState.byPage[1]
    return {
      meetings: bucket.meetings,
      totalCount: bucket.totalCount,
      isLoading: hookState.isLoading,
      error: hookState.error,
    }
  },
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  },
}))

vi.mock('./MeetingCard', () => ({
  MeetingCard: function MeetingCardMock({
    meeting,
    onClick,
  }: {
    meeting: MeetingFormState
    onClick: () => void
  }) {
    return (
      <button type="button" onClick={onClick}>
        {meeting.title}
      </button>
    )
  },
}))

vi.mock('./MeetingDetailsDrawer', () => ({
  MeetingDetailsDrawer: function MeetingDetailsDrawerMock({
    meeting,
    isOpen,
    onClose,
  }: {
    meeting: MeetingFormState | null
    isOpen: boolean
    onClose: () => void
  }) {
    if (!isOpen) return null
    return (
      <div>
        <p>drawer:{meeting?.title ?? 'none'}</p>
        <button type="button" onClick={onClose}>
          Close drawer
        </button>
      </div>
    )
  },
}))

vi.mock('./MeetingStats', () => ({
  MeetingStats: () => <div>stats</div>,
}))

vi.mock('./CurrentWeekCard', () => ({
  CurrentWeekCard: () => <div>current-week</div>,
}))

beforeEach(() => {
  hookState.byPage = {
    1: { meetings: [], totalCount: 0 },
    2: { meetings: [], totalCount: 0 },
  }
  hookState.isLoading = false
  hookState.error = null
})

afterEach(() => {
  cleanup()
})

describe('MeetingsListView', () => {
  it('shows loading, error, and empty catalog states without pagination', () => {
    hookState.isLoading = true
    const { rerender } = render(<MeetingsListView />)
    expect(screen.queryByText('No meetings yet')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Pagination')).not.toBeInTheDocument()

    hookState.isLoading = false
    hookState.error = 'calendar down'
    rerender(<MeetingsListView />)
    expect(screen.getByText('Failed to load meetings')).toBeInTheDocument()
    expect(screen.getByText('calendar down')).toBeInTheDocument()
    expect(screen.queryByText('No meetings yet')).not.toBeInTheDocument()

    hookState.error = null
    rerender(<MeetingsListView />)
    expect(screen.getByText('No meetings yet')).toBeInTheDocument()
    expect(screen.queryByLabelText('Pagination')).not.toBeInTheDocument()
  })

  it('returns to the first page when the current page is empty but meetings exist', async () => {
    const user = userEvent.setup()
    hookState.byPage = {
      1: { meetings: [firstPageMeeting], totalCount: 31 },
      2: { meetings: [], totalCount: 31 },
    }

    render(<MeetingsListView />)
    expect(screen.getByRole('button', { name: 'Weekly standup' })).toBeInTheDocument()
    expect(screen.getByLabelText('Pagination')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '2' }))
    expect(screen.getByText('No meetings on this page.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Weekly standup' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Go to first page' }))
    expect(screen.getByRole('button', { name: 'Weekly standup' })).toBeInTheDocument()
    expect(screen.queryByText('No meetings on this page.')).not.toBeInTheDocument()
  })

  it('opens and closes the meeting details drawer from a card', async () => {
    const user = userEvent.setup()
    hookState.byPage[1] = { meetings: [firstPageMeeting], totalCount: 1 }

    render(<MeetingsListView />)
    expect(screen.queryByText('drawer:Weekly standup')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Pagination')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Weekly standup' }))
    expect(screen.getByText('drawer:Weekly standup')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close drawer' }))
    expect(screen.queryByText('drawer:Weekly standup')).not.toBeInTheDocument()
  })
})
