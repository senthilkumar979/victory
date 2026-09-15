import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SESSION_VIDEO_CATEGORIES } from '@/lib/sessionVideos/sessionVideoCategories'
import type { SessionVideo } from '@/types/sessionVideo.types'

import { VideosBrowsePage } from './VideosBrowsePage'

const hookState = {
  videos: [] as SessionVideo[],
  isLoading: false,
  error: null as string | null,
}

vi.mock('@/hooks/useSessionVideos', () => ({
  useSessionVideos: () => hookState,
}))

vi.mock('next/image', () => ({
  default: ({ alt }: { alt?: string }) => <span data-alt={alt} />,
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

const featured: SessionVideo = {
  id: 'video-featured',
  title: 'Featured React session',
  youtubeUrl: 'https://www.youtube.com/watch?v=bbbbbbbbbbb',
  youtubeVideoId: 'bbbbbbbbbbb',
  category: SESSION_VIDEO_CATEGORIES.REACT_SESSION,
  isFeatured: true,
  viewCount: 20,
  createdBy: 'admin@example.com',
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-01T00:00:00.000Z',
}

const other: SessionVideo = {
  ...featured,
  id: 'video-other',
  title: 'Java streams workshop',
  youtubeVideoId: 'ccccccccccc',
  category: SESSION_VIDEO_CATEGORIES.JAVA_SESSION,
  isFeatured: false,
  viewCount: 5,
  createdAt: '2026-06-01T00:00:00.000Z',
}

beforeEach(() => {
  hookState.videos = []
  hookState.isLoading = false
  hookState.error = null
})

afterEach(() => {
  cleanup()
})

describe('VideosBrowsePage', () => {
  it('renders a loading skeleton without browse chrome', () => {
    hookState.isLoading = true
    render(<VideosBrowsePage />)

    expect(screen.queryByRole('heading', { name: 'Session Videos' })).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Search videos by title...')).not.toBeInTheDocument()
  })

  it('renders the load error instead of empty or search copy', () => {
    hookState.error = 'Could not load videos.'
    render(<VideosBrowsePage />)

    expect(screen.getByText('Could not load videos.')).toBeInTheDocument()
    expect(screen.queryByText('No videos available yet.')).not.toBeInTheDocument()
  })

  it('uses browse mode with a featured video when filters are idle', () => {
    hookState.videos = [featured, other]
    render(<VideosBrowsePage />)

    expect(screen.getByText('Featured')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Featured React session/i }).length).toBeGreaterThan(
      0,
    )
    expect(
      screen.getByRole('link', { name: /Featured React session/i }).getAttribute('href'),
    ).toBe('/secured/videos/video-featured')
    expect(screen.queryByText(/videos found/)).not.toBeInTheDocument()
  })

  it('switches to search results when a query is entered', async () => {
    const user = userEvent.setup()
    hookState.videos = [featured, other]
    render(<VideosBrowsePage />)

    await user.type(screen.getByPlaceholderText('Search videos by title...'), 'java')

    expect(screen.queryByText('Featured')).not.toBeInTheDocument()
    expect(screen.getByText('1 video found')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Java streams workshop/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Featured React session/i })).not.toBeInTheDocument()
  })

  it('shows a no-match message in search mode without hiding the catalog empty-state incorrectly', async () => {
    const user = userEvent.setup()
    hookState.videos = [featured]
    render(<VideosBrowsePage />)

    await user.type(screen.getByPlaceholderText('Search videos by title...'), 'missing')

    expect(screen.getByText('No videos match your search.')).toBeInTheDocument()
    expect(screen.queryByText('No videos available yet.')).not.toBeInTheDocument()
    expect(screen.getByText('0 videos found')).toBeInTheDocument()
  })

  it('shows the empty catalog message when there are no videos', () => {
    render(<VideosBrowsePage />)

    expect(screen.getByText('No videos available yet.')).toBeInTheDocument()
    expect(screen.queryByText('Featured')).not.toBeInTheDocument()
  })
})
