import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Blog } from '@/types/blog.types'

import { Next5List } from './Next5List'

vi.mock('framer-motion', () => ({
  motion: {
    a: 'a',
  },
}))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function blog(overrides: Partial<Blog> = {}): Blog {
  return {
    id: 'blog-1',
    title: 'Ship it',
    author_name: 'Ada',
    published_date: '2026-03-02T00:00:00.000Z',
    cover_image_url: 'https://cdn-images-1.medium.com/cover.jpg',
    link: 'https://medium.com/p/ship-it',
    username: 'ada',
    ...overrides,
  }
}

function publishedLabel(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

describe('Next5List', () => {
  it('renders nothing when there are no posts', () => {
    const { container } = render(<Next5List blogs={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('opens a Medium cover post and formats its date', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    const { container } = render(<Next5List blogs={[blog()]} />)
    const iso = '2026-03-02T00:00:00.000Z'

    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://cdn-images-1.medium.com/cover.jpg',
    )
    expect(screen.getByText('Ada')).toBeInTheDocument()
    expect(screen.getByText(publishedLabel(iso))).toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: 'Read: Ship it' }))
    expect(open).toHaveBeenCalledWith(
      'https://medium.com/p/ship-it',
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('rejects non-Medium covers and distinguishes empty titles from missing ones', () => {
    const { container, rerender } = render(
      <Next5List
        blogs={[
          blog({
            title: '',
            author_name: null,
            published_date: null,
            cover_image_url: 'https://example.com/cover.jpg',
          }),
        ]}
      />,
    )

    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Untitled' })).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('aria-label', 'Read: ')
    expect(screen.queryByText('Ada')).not.toBeInTheDocument()

    rerender(
      <Next5List
        blogs={[
          blog({
            title: null,
            cover_image_url: 'https://cdn-images-2.medium.com/cover.jpg',
          }),
        ]}
      />,
    )

    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Untitled' })).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute(
      'aria-label',
      'Read: Untitled',
    )
  })
})
