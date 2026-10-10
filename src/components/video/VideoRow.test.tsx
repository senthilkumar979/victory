import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { SessionVideo } from '@/types/sessionVideo.types'

import { VideoRow } from './VideoRow'

vi.mock('./VideoCard', () => ({
  VideoCard: ({
    video,
    layout,
  }: {
    video: SessionVideo
    layout?: string
  }) => <article data-layout={layout}>{video.title}</article>,
}))

afterEach(() => {
  cleanup()
})

const video = {
  id: 'video-1',
  title: 'Hooks deep dive',
  youtubeUrl: 'https://www.youtube.com/watch?v=abcdefghijk',
  youtubeVideoId: 'abcdefghijk',
  category: 'react_session',
  isFeatured: false,
  viewCount: 3,
  createdBy: 'mentor@example.com',
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-02T00:00:00.000Z',
} as SessionVideo

describe('VideoRow', () => {
  it('hides the section when there are no videos', () => {
    const { container } = render(<VideoRow title="Most viewed" videos={[]} />)

    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByRole('heading', { name: 'Most viewed' })).toBeNull()
  })

  it('renders a horizontal row without the carousel width lock', () => {
    const { container } = render(
      <VideoRow title="Recent" videos={[video]} layout="horizontal" />,
    )

    expect(screen.getByRole('heading', { name: 'Recent' })).toBeInTheDocument()
    expect(screen.getByText('Hooks deep dive')).toHaveAttribute(
      'data-layout',
      'horizontal',
    )
    expect(container.querySelector('.w-64')).toBeNull()
  })

  it('locks vertical cards to a fixed carousel width', () => {
    const { container } = render(<VideoRow title="Featured" videos={[video]} />)

    expect(screen.getByText('Hooks deep dive')).toHaveAttribute(
      'data-layout',
      'vertical',
    )
    expect(container.querySelector('.w-64')).not.toBeNull()
  })
})
