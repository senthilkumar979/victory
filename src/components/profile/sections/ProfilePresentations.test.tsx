import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { formatDateWithoutTime } from '@/utils/meetingUtils'

import { ProfilePresentations } from './ProfilePresentations'

const { useFetchPresentersByUser } = vi.hoisted(() => ({
  useFetchPresentersByUser: vi.fn(),
}))

vi.mock('../../../hooks/useFetchPresentersByUser', () => ({
  useFetchPresentersByUser,
}))

afterEach(() => {
  cleanup()
})

describe('ProfilePresentations', () => {
  it('shows the loading copy before an error or empty state', () => {
    useFetchPresentersByUser.mockReturnValue({
      presenters: [],
      isLoading: true,
      error: 'Could not load presentations',
    })

    render(<ProfilePresentations studentEmail="ada@mentorbridge.in" />)

    expect(screen.getByText('Loading presentations...')).toBeInTheDocument()
    expect(screen.queryByText(/could not load presentations/i)).not.toBeInTheDocument()
    expect(screen.queryByText('No presentations yet')).not.toBeInTheDocument()
    expect(useFetchPresentersByUser).toHaveBeenCalledWith({
      userEmail: 'ada@mentorbridge.in',
    })
  })

  it('shows the error and hides the empty copy', () => {
    useFetchPresentersByUser.mockReturnValue({
      presenters: [],
      isLoading: false,
      error: 'Could not load presentations',
    })

    render(<ProfilePresentations studentEmail="ada@mentorbridge.in" />)

    expect(screen.getByText('Error: Could not load presentations')).toBeInTheDocument()
    expect(screen.queryByText('No presentations yet')).not.toBeInTheDocument()
  })

  it('shows an empty state when the member has not presented', () => {
    useFetchPresentersByUser.mockReturnValue({
      presenters: [],
      isLoading: false,
      error: null,
    })

    render(<ProfilePresentations studentEmail="ada@mentorbridge.in" />)

    expect(screen.getByText('No presentations yet')).toBeInTheDocument()
  })

  it('lists topics with dates and renders nothing when the list is missing', () => {
    const presentedDate = '2026-06-15T12:00:00.000Z'
    useFetchPresentersByUser.mockReturnValue({
      presenters: [
        {
          id: 'presenter-1',
          presented_by: 'ada@mentorbridge.in',
          presented_date: presentedDate,
          topic: 'Difference engines',
        },
      ],
      isLoading: false,
      error: null,
    })

    const { rerender } = render(
      <ProfilePresentations studentEmail="ada@mentorbridge.in" />,
    )

    expect(screen.getByText('Difference engines')).toBeInTheDocument()
    expect(screen.getByText(formatDateWithoutTime(presentedDate))).toBeInTheDocument()

    useFetchPresentersByUser.mockReturnValue({
      presenters: undefined,
      isLoading: false,
      error: null,
    })
    rerender(<ProfilePresentations studentEmail="ada@mentorbridge.in" />)

    expect(screen.queryByText('No presentations yet')).not.toBeInTheDocument()
    expect(screen.queryByText('Difference engines')).not.toBeInTheDocument()
  })
})
