import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { MeetingFormState } from './Meeting.types'
import type { WeekDay } from '@/hooks/useMeetingsForWeek'

const weekState = vi.hoisted(() => {
  const todayKey = new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Kolkata',
  })
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
  const weekDays: WeekDay[] = dayNames.map((dayName, i) => ({
    key: i === 2 ? todayKey : `2000-01-0${i + 1}`,
    day: String(i + 1),
    month: '01',
    label: `${dayName} 0${i + 1}`,
    date: new Date(2000, 0, i + 1),
    dayName,
  }))
  const untitled: MeetingFormState = {
    id: 'm1',
    title: '',
    date: '2026-09-12T10:30:00.000Z',
    googleGroupId: 'g@test.com',
    description: '',
    meetingLink: '',
    coverImageUrl: '',
  }
  return {
    todayKey,
    weekDays,
    meetingsByDay: { [todayKey]: [untitled] } as Record<
      string,
      MeetingFormState[]
    >,
    isLoading: false,
    error: null as string | null,
  }
})

vi.mock('@/hooks/useMeetingsForWeek', () => ({
  useMeetingsForWeek: () => ({
    weekDays: weekState.weekDays,
    meetingsByDay: weekState.meetingsByDay,
    isLoading: weekState.isLoading,
    error: weekState.error,
    refetch: async () => {},
  }),
}))

vi.mock('@/app/modules/Meetings/MeetingDetailsDrawer', () => ({
  MeetingDetailsDrawer: function MeetingDetailsDrawerMock({
    isOpen,
    onClose,
  }: {
    meeting: { title?: string } | null
    isOpen: boolean
    onClose: () => void
  }) {
    if (!isOpen) return null
    return (
      <section>
        <p>Drawer open</p>
        <button type="button" onClick={onClose}>
          Close drawer
        </button>
      </section>
    )
  },
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    li: 'li',
  },
}))

import { CurrentWeekCard } from './CurrentWeekCard'

afterEach(() => {
  cleanup()
  weekState.isLoading = false
  weekState.error = null
  vi.useRealTimers()
})

describe('CurrentWeekCard', () => {
  it('selects today, shows Untitled meeting, and opens the details drawer', async () => {
    const user = userEvent.setup()
    render(<CurrentWeekCard enableAutoRotate={false} />)

    expect(screen.getByRole('button', { name: /Wed 3\/01/ })).toHaveClass(
      'bg-primary',
    )
    expect(screen.getByText('Untitled meeting')).toBeInTheDocument()

    await user.click(screen.getByText('Untitled meeting'))
    expect(screen.getByText('Drawer open')).toBeInTheDocument()
  })

  it('auto-advances the selected day every 3 seconds unless rotation is disabled', async () => {
    vi.useFakeTimers()
    const { rerender } = render(<CurrentWeekCard enableAutoRotate={false} />)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })
    expect(screen.getByRole('button', { name: /Wed 3\/01/ })).toHaveClass(
      'bg-primary',
    )

    rerender(<CurrentWeekCard enableAutoRotate />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })
    expect(screen.getByRole('button', { name: /Thu 4\/01/ })).toHaveClass(
      'bg-primary',
    )
  })

  it('shows loading, error, and empty-week states', () => {
    weekState.isLoading = true
    const { rerender, container } = render(<CurrentWeekCard />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()

    weekState.isLoading = false
    weekState.error = 'Failed to load meetings'
    rerender(<CurrentWeekCard />)
    expect(screen.getByText('Failed to load meetings')).toBeInTheDocument()
  })
})
