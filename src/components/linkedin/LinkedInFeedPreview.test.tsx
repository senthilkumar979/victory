import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { AwardLinkedInPublishDrawerPreview } from './AwardLinkedInPublishDrawerPreview'
import { LinkedInFeedPreview } from './LinkedInFeedPreview'

const cover = 'https://example.com/cover.png'
const link = 'https://mentorbridge.in/students/ada'

afterEach(() => {
  cleanup()
})

function coloredHashtags(): string[] {
  return [...document.querySelectorAll('.linkedin-commentary span')].map(
    (node) => node.textContent ?? '',
  )
}

describe('LinkedInFeedPreview', () => {
  it('colors whole hashtags and leaves punctuation, bare hashes, and prose plain', () => {
    render(
      <LinkedInFeedPreview
        companyDisplayName="MentorBridge"
        commentary="Ship #MentorBridge #Java_21 #42 #你好 #café now #tag! ##nope # end"
        coverImageUrl={cover}
        primaryLink={link}
      />,
    )

    expect(coloredHashtags()).toEqual([
      '#MentorBridge',
      '#Java_21',
      '#42',
      '#你好',
      '#café',
    ])
    expect(document.querySelector('.linkedin-commentary')?.textContent).toContain('#tag!')
    expect(document.querySelector('.linkedin-commentary')?.textContent).toContain('##nope')
    expect(screen.getByRole('link', { name: link })).toHaveAttribute('target', '_blank')
    expect(document.querySelector('img')).toHaveAttribute('src', cover)
    expect(screen.getByText('MentorBridge')).toBeInTheDocument()
  })

  it('keeps whitespace-only commentary instead of substituting an ellipsis', () => {
    render(
      <LinkedInFeedPreview
        companyDisplayName="MentorBridge"
        commentary="   "
        coverImageUrl={cover}
        primaryLink={link}
      />,
    )

    expect(document.querySelector('.linkedin-commentary')?.textContent).toBe('   ')
  })
})

describe('AwardLinkedInPublishDrawerPreview', () => {
  it('shows a spinner until a cover exists, then the feed, including during bootstrap', () => {
    const { rerender } = render(
      <AwardLinkedInPublishDrawerPreview
        isBootstrapping
        coverUrl={null}
        commentary=""
        companyDisplayName="MentorBridge"
        primaryLink={link}
      />,
    )

    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
    expect(document.querySelector('img')).not.toBeInTheDocument()
    expect(screen.queryByText(/generate a cover image/i)).not.toBeInTheDocument()

    rerender(
      <AwardLinkedInPublishDrawerPreview
        isBootstrapping
        coverUrl={cover}
        commentary=""
        companyDisplayName="MentorBridge"
        primaryLink={link}
      />,
    )

    expect(document.querySelector('.animate-spin')).not.toBeInTheDocument()
    expect(document.querySelector('img')).toHaveAttribute('src', cover)
    expect(document.querySelector('.linkedin-commentary')?.textContent).toBe('…')

    rerender(
      <AwardLinkedInPublishDrawerPreview
        isBootstrapping={false}
        coverUrl={null}
        commentary="Ready"
        companyDisplayName="MentorBridge"
        primaryLink={link}
      />,
    )

    expect(
      screen.getByText('Generate a cover image to see the feed preview.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Ready')).not.toBeInTheDocument()
  })
})
