import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { SocialLinks } from './SocialLinks'

afterEach(() => {
  cleanup()
})

describe('SocialLinks', () => {
  it('renders nothing when every link is empty', () => {
    const { container } = render(
      <SocialLinks socialLinks={{ linkedIn: '', gitHub: '' }} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders only the links that are present, and opens them in a new tab', () => {
    render(
      <SocialLinks
        socialLinks={{
          linkedIn: 'https://www.linkedin.com/in/ada',
          gitHub: '',
          website: 'https://ada.example',
        }}
      />,
    )

    const linkedIn = screen.getByRole('link', { name: 'LinkedIn profile' })
    const website = screen.getByRole('link', { name: 'Personal website' })

    expect(linkedIn).toHaveAttribute('href', 'https://www.linkedin.com/in/ada')
    expect(linkedIn).toHaveAttribute('target', '_blank')
    expect(linkedIn).toHaveAttribute('rel', 'noreferrer')
    expect(website).toHaveAttribute('href', 'https://ada.example')
    expect(screen.queryByRole('link', { name: 'GitHub profile' })).toBeNull()
  })

  it('keeps a whitespace-only link because empty checks do not trim', () => {
    render(<SocialLinks socialLinks={{ linkedIn: '   ', gitHub: '' }} />)

    expect(screen.getByRole('link', { name: 'LinkedIn profile' })).toHaveAttribute(
      'href',
      '   ',
    )
  })
})
