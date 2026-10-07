import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Blog } from '@/types/blog.types'

import { FeaturedCarousel } from './FeaturedCarousel'

vi.mock('framer-motion', () => {
  function MotionAnchor({
    children,
    ...props
  }: { children?: ReactNode } & Record<string, unknown>) {
    const rest = { ...props }
    delete rest.initial
    delete rest.animate
    delete rest.exit
    delete rest.transition
    return <a {...rest}>{children}</a>
  }

  return {
    AnimatePresence: function AnimatePresence({ children }: { children?: ReactNode }) {
      return children
    },
    motion: { a: MotionAnchor },
  }
})

const mediumCover = 'https://cdn-images-1.medium.com/max/800/story.jpg'
const publishedDate = '2026-06-15T12:00:00.000Z'

function expectedDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function blog(overrides: Partial<Blog> = {}): Blog {
  return {
    id: 'blog-1',
    title: 'How bridges work',
    author_name: 'Ada Lovelace',
    published_date: publishedDate,
    cover_image_url: mediumCover,
    link: 'https://medium.com/@ada/how-bridges-work',
    username: 'ada',
    ...overrides,
  }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('FeaturedCarousel', () => {
  it('renders nothing when there are no posts', () => {
    const { container } = render(<FeaturedCarousel blogs={[]} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('shows a Medium cover and hides controls for a single slide', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)

    render(<FeaturedCarousel blogs={[blog()]} />)

    expect(document.querySelector('img')).toHaveAttribute('src', mediumCover)
    expect(screen.getByRole('link', { name: 'Read: How bridges work' })).toHaveAttribute(
      'href',
      'https://medium.com/@ada/how-bridges-work',
    )
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText(expectedDate(publishedDate))).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next slide' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: 'Read: How bridges work' }))

    expect(open).toHaveBeenCalledWith(
      'https://medium.com/@ada/how-bridges-work',
      '_blank',
      'noopener,noreferrer',
    )

    act(() => {
      vi.advanceTimersByTime(12000)
    })

    expect(screen.getByRole('heading', { name: 'How bridges work' })).toBeInTheDocument()
  })

  it('rejects non-Medium covers and uses different title fallbacks for empty and null', () => {
    const { rerender } = render(
      <FeaturedCarousel
        blogs={[
          blog({
            title: '',
            author_name: '',
            published_date: '',
            cover_image_url: 'https://example.com/cdn-images-1.medium.com/story.jpg',
          }),
        ]}
      />,
    )

    expect(document.querySelector('img')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Untitled' })).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('aria-label', 'Read: ')
    expect(screen.queryByText('·')).not.toBeInTheDocument()

    rerender(
      <FeaturedCarousel
        blogs={[
          blog({
            id: 'blog-null',
            title: null,
            author_name: null,
            published_date: null,
            cover_image_url: 'http://cdn-images-1.medium.com/story.jpg',
          }),
        ]}
      />,
    )

    expect(document.querySelector('img')).not.toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('aria-label', 'Read: Untitled')
  })

  it('wraps next and previous and jumps from the slide dots', () => {
    render(
      <FeaturedCarousel
        blogs={[
          blog({ id: 'a', title: 'Alpha' }),
          blog({ id: 'b', title: 'Beta' }),
          blog({ id: 'c', title: 'Gamma' }),
        ]}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Alpha' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Previous slide' }))
    expect(screen.getByRole('heading', { name: 'Gamma' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(screen.getByRole('heading', { name: 'Alpha' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 2' }))
    expect(screen.getByRole('heading', { name: 'Beta' })).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(6000)
    })

    expect(screen.getByRole('heading', { name: 'Gamma' })).toBeInTheDocument()
  })
})
