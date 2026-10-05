import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { BlogCard } from './BlogCard'

const mediumCover = 'https://cdn-images-1.medium.com/max/800/story.jpg'
const publishedDate = '2026-06-15T12:00:00.000Z'

function expectedDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('BlogCard', () => {
  it('shows a Medium cover, author, and date, and opens the post in a new tab', async () => {
    const user = userEvent.setup()
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)

    render(
      <BlogCard
        id="blog-1"
        title="How bridges work"
        author_name="Ada Lovelace"
        published_date={publishedDate}
        cover_image_url={mediumCover}
        link="https://medium.com/@ada/how-bridges-work"
      />,
    )

    expect(document.querySelector('img')).toHaveAttribute('src', mediumCover)
    expect(screen.getByRole('link', { name: 'Read: How bridges work' })).toHaveAttribute(
      'href',
      'https://medium.com/@ada/how-bridges-work',
    )
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText(expectedDate(publishedDate))).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Read: How bridges work' }))

    expect(open).toHaveBeenCalledWith(
      'https://medium.com/@ada/how-bridges-work',
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('rejects non-Medium covers and falls back when title, author, or date are missing', () => {
    const { rerender } = render(
      <BlogCard
        id="blog-2"
        title=""
        author_name=""
        published_date=""
        cover_image_url="https://example.com/cdn-images-1.medium.com/story.jpg"
        link="https://example.com/post"
      />,
    )

    expect(document.querySelector('img')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Untitled' })).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('aria-label', 'Read: ')
    expect(screen.queryByText('·')).not.toBeInTheDocument()

    rerender(
      <BlogCard
        id="blog-3"
        title={null}
        author_name={null}
        published_date={null}
        cover_image_url="http://cdn-images-1.medium.com/story.jpg"
        link="https://example.com/other"
      />,
    )

    expect(document.querySelector('img')).not.toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('aria-label', 'Read: Untitled')
  })
})
