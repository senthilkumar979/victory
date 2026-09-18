import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { VisitorAssistantMessage } from './VisitorAssistantMessage'

vi.mock('next/link', () => ({
  default: function NextLinkMock({
    href,
    children,
  }: {
    href: string
    children: ReactNode
  }) {
    return <a href={href}>{children}</a>
  },
}))

afterEach(() => {
  cleanup()
})

describe('VisitorAssistantMessage', () => {
  it('uses the first mentorbridge email in a contact hint', () => {
    render(
      <VisitorAssistantMessage content="[[MB_CONTACT]]Please email hello@mentorbridge.in or later@mentorbridge.in[[/MB_CONTACT]]" />,
    )

    expect(screen.getByText('Go deeper')).toBeInTheDocument()
    const emailLink = screen.getByRole('link', { name: /Email:/ })
    expect(emailLink).toHaveAttribute('href', 'mailto:hello@mentorbridge.in')
    expect(emailLink).toHaveTextContent('hello@mentorbridge.in')
    expect(emailLink).not.toHaveTextContent('later@mentorbridge.in')
  })

  it('falls back to the default contact email when the hint has no mentorbridge address', () => {
    render(
      <VisitorAssistantMessage content="[[MB_CONTACT]]Please reach out to other@example.com[[/MB_CONTACT]]" />,
    )

    const emailLink = screen.getByRole('link', { name: /Email:/ })
    expect(emailLink).toHaveAttribute(
      'href',
      'mailto:senthilkumar@mentorbridge.in',
    )
    expect(emailLink).toHaveTextContent('senthilkumar@mentorbridge.in')
  })

  it('renders explore shortcuts and leaves unmarked copy as body text', () => {
    render(
      <VisitorAssistantMessage
        content={`Welcome to MentorBridge.

[[MB_EXPLORE]]Browse placements and students on this site[[/MB_EXPLORE]]`}
      />,
    )

    expect(screen.getByText('Welcome to MentorBridge.')).toBeInTheDocument()
    expect(screen.getByText('On this website')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Placements' })).toHaveAttribute(
      'href',
      '/',
    )
    expect(screen.getByRole('link', { name: 'Students' })).toHaveAttribute(
      'href',
      '/students',
    )
    expect(screen.queryByText('Go deeper')).not.toBeInTheDocument()
  })
})
