import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { MeetingFormState } from '@/app/modules/Meetings/Meeting.types'

import { MemberDashboardParticipationsSection } from './MemberDashboardParticipationsSection'

vi.mock('framer-motion', () => ({
  motion: {
    li: 'li',
  },
}))

function makeMeeting(
  index: number,
  overrides: Partial<MeetingFormState> = {},
): MeetingFormState {
  return {
    id: `m-${index}`,
    title: `Session ${index}`,
    date: '2026-09-01T03:30:00.000Z',
    googleGroupId: 'team@test.com',
    description: '',
    meetingLink: `https://meet.google.com/abc-defg-hij${index}`,
    coverImageUrl: '',
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('MemberDashboardParticipationsSection', () => {
  it('keeps loading from showing the error and caps the list at five', () => {
    const { rerender } = render(
      <MemberDashboardParticipationsSection
        participations={[]}
        isLoading
        error="Unable to load sessions"
      />,
    )

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(
      screen.queryByText(/No recorded participations/),
    ).not.toBeInTheDocument()

    rerender(
      <MemberDashboardParticipationsSection
        participations={Array.from({ length: 6 }, (_, i) =>
          makeMeeting(i + 1),
        )}
        isLoading={false}
        error={null}
      />,
    )

    expect(screen.getByText('Session 1')).toBeInTheDocument()
    expect(screen.getByText('Session 5')).toBeInTheDocument()
    expect(screen.queryByText('Session 6')).not.toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /open link/i })).toHaveLength(5)
  })

  it('hides whitespace-only meeting links and shows the empty state', () => {
    const { rerender } = render(
      <MemberDashboardParticipationsSection
        participations={[makeMeeting(1, { meetingLink: '   ' })]}
        isLoading={false}
        error={null}
      />,
    )

    expect(screen.getByText('Session 1')).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /open link/i }),
    ).not.toBeInTheDocument()

    rerender(
      <MemberDashboardParticipationsSection
        participations={[]}
        isLoading={false}
        error={null}
      />,
    )
    expect(
      screen.getByText(/No recorded participations yet/),
    ).toBeInTheDocument()
  })
})
