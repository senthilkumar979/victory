import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Blog } from '@/types/blog.types'

import { ProfileBlogs } from './ProfileBlogs'

vi.mock('framer-motion', () => ({
  motion: {
    a: 'a',
  },
}))

function makeBlog(overrides: Partial<Blog> = {}): Blog {
  return {
    id: 'blog-1',
    title: 'How to test',
    author_name: 'Ada',
    published_date: '2026-01-05T12:00:00.000Z',
    cover_image_url: null,
    link: 'https://medium.com/@ada/how-to-test',
    username: 'ada',
    ...overrides,
  }
}

describe('ProfileBlogs', () => {
  afterEach(() => {
    cleanup()
  })

  it('shows skeletons while loading and skips the empty state', () => {
    const { container } = render(
      <ProfileBlogs blogs={[makeBlog()]} loading />,
    )

    expect(screen.queryByText('How to test')).not.toBeInTheDocument()
    expect(screen.queryByText('No blogs published yet')).not.toBeInTheDocument()
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(4)
  })

  it('shows the empty state when there are no blogs', () => {
    render(<ProfileBlogs blogs={[]} loading={false} />)

    expect(screen.getByText('No blogs published yet')).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /view publications/i }),
    ).not.toBeInTheDocument()
  })

  it('links the Medium profile from the first username and ignores later ones', () => {
    render(
      <ProfileBlogs
        loading={false}
        blogs={[
          makeBlog({ username: 'first-author', title: 'First post' }),
          makeBlog({
            id: 'blog-2',
            username: 'second-author',
            title: 'Second post',
            link: 'https://medium.com/@second/post',
          }),
        ]}
      />,
    )

    const publications = screen.getByRole('link', { name: /view publications/i })
    expect(publications).toHaveAttribute(
      'href',
      'https://medium.com/@first-author',
    )
    expect(publications).toHaveAttribute('target', '_blank')
    expect(publications).toHaveAttribute('rel', 'noreferrer')
  })

  it('omits the profile link when the first username is missing', () => {
    render(
      <ProfileBlogs
        loading={false}
        blogs={[makeBlog({ username: '' })]}
      />,
    )

    expect(
      screen.queryByRole('link', { name: /view publications/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /how to test/i }),
    ).toHaveAttribute('href', 'https://medium.com/@ada/how-to-test')
  })

  it('renders only Medium CDN covers and skips a null publish date', () => {
    const mediumCover = 'https://cdn-images-1.medium.com/max/800/photo.jpg'
    const { container } = render(
      <ProfileBlogs
        loading={false}
        blogs={[
          makeBlog({
            title: 'Dated post',
            cover_image_url: mediumCover,
            published_date: '2026-01-05T12:00:00.000Z',
          }),
          makeBlog({
            id: 'blog-2',
            title: 'Undated post',
            link: 'https://medium.com/@ada/undated',
            cover_image_url: 'https://example.com/not-medium.jpg',
            published_date: null,
          }),
        ]}
      />,
    )

    const images = container.querySelectorAll('img')
    expect(images).toHaveLength(1)
    expect(images[0]).toHaveAttribute('src', mediumCover)
    expect(screen.getByRole('link', { name: /^dated post/i })).toHaveTextContent(
      'Jan 5, 2026',
    )
    expect(screen.getByRole('link', { name: /^undated post/i })).not.toHaveTextContent(
      'Invalid Date',
    )
  })
})
