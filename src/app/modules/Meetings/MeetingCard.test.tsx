import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MeetingCard } from './MeetingCard'
import type { MeetingFormState } from './Meeting.types'

vi.mock('framer-motion', () => ({
  motion: {
    article: 'article',
  },
}))

vi.mock('./MeetingCoverImage', () => ({
  MeetingCoverImage: () => <div>cover</div>,
}))

vi.mock('next/link', () => ({
  default: function LinkMock({
    href,
    children,
  }: {
    href: string
    children: React.ReactNode
  }) {
    return <a href={href}>{children}</a>
  },
}))

function meeting(overrides: Partial<MeetingFormState> = {}): MeetingFormState {
  return {
    id: 'm1',
    title: 'Sprint review',
    date: '2026-09-12T10:30:00.000Z',
    googleGroupId: 'g@test.com',
    description: '<p>Discuss <strong>goals</strong></p>',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    coverImageUrl: '',
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('MeetingCard', () => {
  it('falls back to Untitled meeting and hides whitespace-only join links', () => {
    render(
      <MeetingCard
        meeting={meeting({ title: '', meetingLink: '   ' })}
        onClick={() => {}}
      />,
    )

    expect(screen.getByText('Untitled meeting')).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /Join meeting/ }),
    ).not.toBeInTheDocument()
  })

  it('strips HTML, truncates long descriptions, and keeps Join from opening the card', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const long = 'x'.repeat(120)

    render(
      <MeetingCard
        meeting={meeting({
          description: `<p>${long}</p><script>alert(1)</script>`,
        })}
        onClick={onClick}
      />,
    )

    expect(screen.getByText(`${'x'.repeat(100)}...`)).toBeInTheDocument()
    expect(screen.queryByText(/<script>/)).not.toBeInTheDocument()

    const join = screen.getByRole('link', { name: /Join meeting/ })
    join.addEventListener('click', (event) => event.preventDefault())
    await user.click(join)
    expect(onClick).not.toHaveBeenCalled()
  })
})
