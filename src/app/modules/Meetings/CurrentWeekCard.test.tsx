import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { MeetingFormState } from '@/app/modules/Meetings/Meeting.types'
import { MemberDashboardWeekSection } from '@/app/modules/MemberDashboard/MemberDashboardWeekSection'
import type { WeekDay } from '@/hooks/useMeetingsForWeek'

import { CurrentWeekCard } from './CurrentWeekCard'

const weekState = {
  weekDays: [] as WeekDay[],
  meetingsByDay: {} as Record<string, MeetingFormState[]>,
  isLoading: false,
  error: null as string | null,
}

vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    li: 'li',
  },
}))

vi.mock('@/hooks/useMeetingsForWeek', () => ({
  useMeetingsForWeek: () => weekState,
}))

vi.mock('@/app/modules/Meetings/MeetingDetailsDrawer', () => ({
  MeetingDetailsDrawer: ({
    meeting,
    isOpen,
    onClose,
  }: {
    meeting: MeetingFormState | null
    isOpen: boolean
    onClose: () => void
  }) =>
    isOpen ? (
      <div role="dialog">
        <p>{meeting?.title}</p>
        <button type="button" onClick={onClose}>
          Close details
        </button>
      </div>
    ) : null,
}))

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

function buildWeek(): WeekDay[] {
  const monday = new Date('2026-07-13T00:00:00.000Z')
  return DAY_NAMES.map((dayName, index) => {
    const date = new Date(monday)
    date.setUTCDate(monday.getUTCDate() + index)
    const day = String(date.getUTCDate()).padStart(2, '0')
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    return {
      key: date.toISOString().slice(0, 10),
      day,
      month,
      label: `${day}/${month}`,
      date,
      dayName,
    }
  })
}

function meeting(overrides: Partial<MeetingFormState>): MeetingFormState {
  return {
    id: 'meeting',
    title: 'Meeting',
    date: '2026-07-15T08:00:00.000Z',
    googleGroupId: 'group-1',
    description: '',
    meetingLink: '',
    coverImageUrl: '',
    ...overrides,
  }
}

function loadPopulatedWeek() {
  weekState.weekDays = buildWeek()
  weekState.meetingsByDay = {
    '2026-07-13': [
      meeting({
        id: 'mon',
        title: 'Kickoff',
        date: '2026-07-13T04:30:00.000Z',
      }),
    ],
    '2026-07-14': [],
    '2026-07-15': [
      meeting({
        id: 'wed',
        title: 'Design review',
        date: '2026-07-15T08:00:00.000Z',
      }),
    ],
    '2026-07-16': [
      meeting({
        id: 'thu',
        title: 'Office hours',
        date: '2026-07-16T09:00:00.000Z',
      }),
    ],
    '2026-07-17': [],
    '2026-07-18': [
      meeting({
        id: 'sat',
        title: '',
        date: '2026-07-18T08:00:00.000Z',
      }),
    ],
    '2026-07-19': [meeting({ id: 'sun', title: 'No clock', date: '' })],
  }
  weekState.isLoading = false
  weekState.error = null
}

describe('CurrentWeekCard', () => {
  beforeEach(() => {
    loadPopulatedWeek()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-15T08:00:00.000Z'))
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('shows a loading placeholder before an error or the week', () => {
    weekState.isLoading = true
    weekState.error = 'Could not load this week'

    const { container } = render(<CurrentWeekCard />)

    expect(container.querySelector('.animate-pulse')).toBeTruthy()
    expect(screen.queryByText('Could not load this week')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows the fetch error and hides the day strip', () => {
    weekState.isLoading = false
    weekState.error = 'Could not load this week'

    const { container } = render(<CurrentWeekCard />)

    expect(screen.getByText('Could not load this week')).toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeNull()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders nothing when the week has no days', () => {
    weekState.weekDays = []
    weekState.meetingsByDay = {}

    const { container } = render(<CurrentWeekCard />)

    expect(container).toBeEmptyDOMElement()
  })

  it('opens on today in IST and switches the visible meetings with the day', () => {
    render(<CurrentWeekCard />)

    expect(
      screen.getByRole('heading', { name: 'July (13/07 \u2013 19/07)' }),
    ).toBeInTheDocument()
    const wednesday = screen.getByRole('button', { name: /Wed 15\/07/ })
    expect(wednesday).toHaveClass('bg-primary')
    expect(wednesday).not.toHaveClass('ring-2')
    expect(screen.getByRole('button', { name: /Design review/ })).toHaveTextContent(
      '13:30 IST',
    )
    expect(screen.queryByRole('button', { name: /Office hours/ })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Thu 16\/07/ }))

    expect(wednesday).toHaveClass('ring-2', 'ring-primary')
    expect(wednesday).not.toHaveClass('bg-primary')
    expect(screen.getByRole('button', { name: /Thu 16\/07/ })).toHaveClass('bg-primary')
    expect(screen.getByRole('button', { name: /Office hours/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Design review/ })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Fri 17\/07/ }))

    expect(screen.getByRole('heading', { name: 'No events on 17/07' })).toBeInTheDocument()
  })

  it('opens a meeting on click or Enter and labels blank titles and times', () => {
    render(<CurrentWeekCard />)

    const designReview = screen.getByRole('button', { name: /Design review/ })
    fireEvent.keyDown(designReview, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.keyDown(designReview, { key: 'Enter' })
    expect(screen.getByRole('dialog')).toHaveTextContent('Design review')

    fireEvent.click(screen.getByRole('button', { name: 'Close details' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Sat 18\/07/ }))
    expect(screen.getByRole('button', { name: /Untitled meeting/ })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Sun 19\/07/ }))
    expect(screen.getByRole('button', { name: /No clock/ })).toHaveTextContent('IST')
    expect(screen.getByRole('button', { name: /No clock/ })).not.toHaveTextContent(
      'Invalid Date',
    )
  })

  it('advances one day every three seconds and wraps from Sunday to Monday', () => {
    render(<CurrentWeekCard />)

    expect(screen.getByRole('button', { name: /Design review/ })).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(screen.getByRole('button', { name: /Office hours/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Design review/ })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Sun 19\/07/ }))
    expect(screen.getByRole('button', { name: /No clock/ })).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(screen.getByRole('button', { name: /Kickoff/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /No clock/ })).not.toBeInTheDocument()
  })

  it('keeps the member dashboard week on today', () => {
    render(<MemberDashboardWeekSection />)

    expect(screen.getByRole('heading', { name: 'This week' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Design review/ })).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(9000)
    })

    expect(screen.getByRole('button', { name: /Design review/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Office hours/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Kickoff/ })).not.toBeInTheDocument()
  })
})
