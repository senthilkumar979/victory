import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MeetingStats } from './MeetingStats'

const statsState = vi.hoisted(() => ({
  totalMeetings: 0,
  meetingsThisMonth: 0,
  meetingsThisWeek: 0,
  isLoading: false,
  error: null as string | null,
  refetch: vi.fn(),
}))

vi.mock('@/hooks/useMeetingStats', () => ({
  useMeetingStats: () => statsState,
}))

vi.mock('@/components/profile/AnimatedCounter', () => ({
  AnimatedCounter: ({ value }: { value: number }) => <span>{value}</span>,
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
  },
}))

describe('MeetingStats', () => {
  afterEach(() => {
    cleanup()
    statsState.totalMeetings = 0
    statsState.meetingsThisMonth = 0
    statsState.meetingsThisWeek = 0
    statsState.isLoading = false
    statsState.error = null
  })

  it('shows the loading skeleton ahead of an error', () => {
    statsState.isLoading = true
    statsState.error = 'meetings unavailable'

    render(<MeetingStats />)

    expect(screen.queryByText('meetings unavailable')).not.toBeInTheDocument()
    expect(screen.queryByText('Total Meetings')).not.toBeInTheDocument()
  })

  it('shows the hook error once loading finishes', () => {
    statsState.error = 'meetings unavailable'

    render(<MeetingStats />)

    expect(screen.getByText('meetings unavailable')).toBeInTheDocument()
    expect(screen.queryByText('Total Meetings')).not.toBeInTheDocument()
  })

  it('renders zero counts instead of hiding the cards', () => {
    render(<MeetingStats />)

    expect(screen.getByText('Total Meetings')).toBeInTheDocument()
    expect(screen.getByText('Meetings This Month')).toBeInTheDocument()
    expect(screen.getByText('Meetings This Week')).toBeInTheDocument()
    expect(screen.getAllByText('0')).toHaveLength(3)
  })
})
