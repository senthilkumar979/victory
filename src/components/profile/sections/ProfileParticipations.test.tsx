import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { MeetingFormState } from '@/app/modules/Meetings/Meeting.types'

import { ProfileParticipations } from './ProfileParticipations'

const state = vi.hoisted(() => ({
  participations: [] as MeetingFormState[],
  isLoading: false,
  error: null as string | null,
  serialNo: undefined as number | undefined,
}))

vi.mock('@/hooks/useFetchParticipationsByUser', () => ({
  useFetchParticipationsByUser: (serialNo: number) => {
    state.serialNo = serialNo
    return {
      participations: state.participations,
      isLoading: state.isLoading,
      error: state.error,
    }
  },
}))

vi.mock('./AnimatedParticipations', () => ({
  AnimatedParticipations: function AnimatedParticipations({
    data,
    onClick,
  }: {
    data: MeetingFormState[]
    onClick: (meeting: MeetingFormState) => void
  }) {
    return (
      <ul>
        {data.map((meeting) => (
          <li key={meeting.id}>
            <button type="button" onClick={() => onClick(meeting)}>
              {meeting.title}
            </button>
          </li>
        ))}
      </ul>
    )
  },
}))

vi.mock('@/app/modules/Meetings/MeetingDetailsDrawer', () => ({
  MeetingDetailsDrawer: function MeetingDetailsDrawer({
    meeting,
    isOpen,
    onClose,
    isHideAttendance,
  }: {
    meeting: MeetingFormState | null
    isOpen: boolean
    onClose: () => void
    isHideAttendance?: boolean
  }) {
    return (
      <section>
        <span>{isOpen ? 'drawer-open' : 'drawer-closed'}</span>
        <span>{meeting?.title ?? 'no-meeting'}</span>
        <span>
          {isHideAttendance ? 'attendance-hidden' : 'attendance-shown'}
        </span>
        <button type="button" onClick={onClose}>
          Close drawer
        </button>
      </section>
    )
  },
}))

function meeting(title: string): MeetingFormState {
  return {
    id: title,
    title,
    date: '2026-04-01T00:00:00.000Z',
    googleGroupId: 'group-1',
    description: 'Weekly sync',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    coverImageUrl: '',
  }
}

afterEach(() => {
  cleanup()
  state.participations = []
  state.isLoading = false
  state.error = null
  state.serialNo = undefined
})

describe('ProfileParticipations', () => {
  it('hides the list while loading and still shows an error', () => {
    state.participations = [meeting('Retro')]
    state.isLoading = true
    state.error = 'slow'

    render(<ProfileParticipations serialNo={12} />)

    expect(state.serialNo).toBe(12)
    expect(screen.getByText('Loading participations…')).toBeInTheDocument()
    expect(screen.getByText('slow')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Retro' })).not.toBeInTheDocument()
    expect(
      screen.queryByText('No meeting participations yet'),
    ).not.toBeInTheDocument()
  })

  it('shows an error instead of the empty copy', () => {
    state.error = 'Failed to load participations'

    render(<ProfileParticipations serialNo={4} />)

    expect(screen.getByText('Failed to load participations')).toBeInTheDocument()
    expect(
      screen.queryByText('No meeting participations yet'),
    ).not.toBeInTheDocument()
  })

  it('shows the empty copy when the lookup succeeds with no rows', () => {
    render(<ProfileParticipations />)

    expect(state.serialNo).toBe(0)
    expect(
      screen.getByText('No meeting participations yet'),
    ).toBeInTheDocument()
    expect(screen.getByText('drawer-closed')).toBeInTheDocument()
    expect(screen.getByText('attendance-hidden')).toBeInTheDocument()
  })

  it('opens the selected meeting and clears it on close', () => {
    state.participations = [meeting('Design review'), meeting('Demo')]

    render(<ProfileParticipations serialNo={9} />)

    fireEvent.click(screen.getByRole('button', { name: 'Design review' }))

    expect(screen.getByText('drawer-open').parentElement).toHaveTextContent('Design review')
    expect(screen.getByText('attendance-hidden')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close drawer' }))

    expect(screen.getByText('drawer-closed')).toBeInTheDocument()
    expect(screen.getByText('no-meeting')).toBeInTheDocument()
  })
})
