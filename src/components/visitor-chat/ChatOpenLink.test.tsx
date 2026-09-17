import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { ChatOpenLink } from './ChatOpenLink'

afterEach(() => {
  cleanup()
})

describe('ChatOpenLink', () => {
  it('strips trailing punctuation from http links and opens them in a new tab', () => {
    render(<ChatOpenLink href="https://mentorbridge.in/students)." />)

    const link = screen.getByRole('link', { name: /Open/ })
    expect(link).toHaveAttribute('href', 'https://mentorbridge.in/students')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders mailto links as Email without a new-tab target', () => {
    render(<ChatOpenLink href="mailto:senthilkumar@mentorbridge.in," />)

    const link = screen.getByRole('link', { name: /Email/ })
    expect(link).toHaveAttribute(
      'href',
      'mailto:senthilkumar@mentorbridge.in',
    )
    expect(link).not.toHaveAttribute('target')
    expect(screen.queryByRole('link', { name: /Open/ })).not.toBeInTheDocument()
  })
})
