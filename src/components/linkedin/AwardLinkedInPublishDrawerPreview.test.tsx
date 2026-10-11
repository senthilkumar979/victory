import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { AwardLinkedInPublishDrawerPreview } from './AwardLinkedInPublishDrawerPreview'

const previewProps = {
  isBootstrapping: false,
  coverUrl: null as string | null,
  commentary: 'Shipped the award',
  companyDisplayName: 'MentorBridge',
  primaryLink: 'https://mentorbridge.in/awards/1',
}

afterEach(() => {
  cleanup()
})

describe('AwardLinkedInPublishDrawerPreview', () => {
  it('shows a spinner while bootstrapping when the cover is missing', () => {
    const { container } = render(
      <AwardLinkedInPublishDrawerPreview
        {...previewProps}
        isBootstrapping
        coverUrl={null}
      />,
    )

    expect(container.querySelector('.animate-spin')).toBeTruthy()
    expect(screen.queryByText('MentorBridge')).toBeNull()
    expect(screen.queryByText(/Generate a cover image/)).toBeNull()
  })

  it('treats an empty cover url as missing during bootstrap', () => {
    const { container } = render(
      <AwardLinkedInPublishDrawerPreview
        {...previewProps}
        isBootstrapping
        coverUrl=""
      />,
    )

    expect(container.querySelector('.animate-spin')).toBeTruthy()
    expect(screen.queryByText('MentorBridge')).toBeNull()
  })

  it('shows the feed preview when a cover exists, even while bootstrapping', () => {
    render(
      <AwardLinkedInPublishDrawerPreview
        {...previewProps}
        isBootstrapping
        coverUrl="https://cdn.example/cover.png"
        commentary=""
      />,
    )

    expect(screen.getByText('MentorBridge')).toBeInTheDocument()
    expect(screen.getByText('…')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: previewProps.primaryLink })).toHaveAttribute(
      'href',
      previewProps.primaryLink,
    )
    expect(document.querySelector('img')).toHaveAttribute(
      'src',
      'https://cdn.example/cover.png',
    )
    expect(document.querySelector('.animate-spin')).toBeNull()
  })

  it('asks for a cover when nothing has been generated', () => {
    render(<AwardLinkedInPublishDrawerPreview {...previewProps} coverUrl="" />)

    expect(
      screen.getByText('Generate a cover image to see the feed preview.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('MentorBridge')).toBeNull()
  })

  it('keeps whitespace commentary instead of the empty placeholder', () => {
    const { container } = render(
      <AwardLinkedInPublishDrawerPreview
        {...previewProps}
        coverUrl="https://cdn.example/cover.png"
        commentary="   "
      />,
    )

    expect(container.querySelector('.linkedin-commentary')?.textContent).toBe('   ')
  })
})
