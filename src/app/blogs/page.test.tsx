import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import BlogsPage from './page'

const blogs = vi.hoisted(() => ({
  featured: [] as { id: string }[],
  next5: [] as { id: string }[],
  remaining: [] as { id: string; link: string }[],
  authors: ['Ada Lovelace'],
  heroLoading: false,
  remainingLoading: false,
  error: null as string | null,
  totalCount: 0,
  remainingPage: 1,
  totalRemainingPages: 1,
  setRemainingPage: vi.fn(),
  authorFilter: null as string | null,
  setAuthorFilter: vi.fn(),
}))

vi.mock('@/hooks/useBlogs', () => ({ useBlogs: () => blogs }))

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
  motion: new Proxy({}, { get: (_t, tag) => (typeof tag === 'string' ? tag : undefined) }),
}))

vi.mock('@/app/blogs/components/FeaturedCarousel', () => ({
  FeaturedCarousel: () => <div>featured-carousel</div>,
}))
vi.mock('@/app/blogs/components/Next5List', () => ({
  Next5List: () => <div>next-5</div>,
}))
vi.mock('@/app/blogs/components/BlogGrid', () => ({
  BlogGrid: ({ blogs: items }: { blogs: { id: string }[] }) => <div>grid:{items.length}</div>,
}))
vi.mock('@/app/blogs/components/Pagination', () => ({
  Pagination: ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }) => (
    <button type="button" onClick={() => onPageChange(currentPage + 1)}>
      Page {currentPage} of {totalPages}
    </button>
  ),
}))
vi.mock('@/app/blogs/components/BlogFilter', () => ({
  BlogFilter: ({
    disabled,
    value,
    onChange,
  }: {
    disabled?: boolean
    value: string | null
    onChange: (author: string | null) => void
  }) => (
    <button type="button" disabled={disabled} onClick={() => onChange('Ada Lovelace')}>
      {value ?? 'all-authors'}
    </button>
  ),
}))

function resetBlogs() {
  Object.assign(blogs, {
    featured: [],
    next5: [],
    remaining: [],
    authors: ['Ada Lovelace'],
    heroLoading: false,
    remainingLoading: false,
    error: null,
    totalCount: 0,
    remainingPage: 1,
    totalRemainingPages: 1,
    authorFilter: null,
    setRemainingPage: vi.fn(),
    setAuthorFilter: vi.fn(),
  })
}

describe('blogs page', () => {
  const scrollTo = vi.fn()

  beforeEach(() => {
    resetBlogs()
    scrollTo.mockReset()
    window.scrollTo = scrollTo
  })

  afterEach(() => {
    cleanup()
  })

  it('hides the remaining section until there are more than ten stories', () => {
    blogs.totalCount = 10
    blogs.remaining = [{ id: 'extra', link: 'https://example.com' }]
    render(<BlogsPage />)
    expect(screen.queryByRole('heading', { name: 'More stories' })).not.toBeInTheDocument()
    expect(screen.queryByText(/grid:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument()
  })

  it('shows an empty catalog only after the hero finishes loading', () => {
    blogs.heroLoading = true
    const { rerender } = render(<BlogsPage />)
    expect(screen.queryByText('No blogs available')).not.toBeInTheDocument()
    expect(screen.queryByText('featured-carousel')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'all-authors' })).toBeDisabled()
    blogs.heroLoading = false
    rerender(<BlogsPage />)
    expect(screen.getByText('No blogs available')).toBeInTheDocument()
    expect(screen.getByText('featured-carousel')).toBeInTheDocument()
  })

  it('caps the remaining window and scrolls when the page changes', async () => {
    const user = userEvent.setup()
    blogs.totalCount = 45
    blogs.totalRemainingPages = 3
    blogs.remaining = [{ id: '11', link: 'https://example.com/11' }]
    blogs.error = 'Could not refresh stories'
    render(<BlogsPage />)
    expect(screen.getByRole('alert')).toHaveTextContent('Could not refresh stories')
    expect(screen.getByText(/Showing 11–\s*30 of 45/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Page 1 of 3' }))
    expect(blogs.setRemainingPage).toHaveBeenCalledWith(2)
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    cleanup()
    blogs.remainingPage = 2
    render(<BlogsPage />)
    expect(screen.getByText(/Showing 31–\s*45 of 45/)).toBeInTheDocument()
  })

  it('prefers loading and empty remaining states over the range', () => {
    blogs.totalCount = 11
    blogs.remainingLoading = true
    blogs.totalRemainingPages = 2
    const { rerender } = render(<BlogsPage />)
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Page/ })).not.toBeInTheDocument()
    blogs.remainingLoading = false
    blogs.totalRemainingPages = 1
    rerender(<BlogsPage />)
    expect(screen.getByText('No more stories.')).toBeInTheDocument()
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument()
  })

  it('forwards the selected author', async () => {
    const user = userEvent.setup()
    blogs.totalCount = 3
    render(<BlogsPage />)
    await user.click(screen.getByRole('button', { name: 'all-authors' }))
    expect(blogs.setAuthorFilter).toHaveBeenCalledWith('Ada Lovelace')
  })
})
