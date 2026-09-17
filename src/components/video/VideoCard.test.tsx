import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SESSION_VIDEO_CATEGORIES } from '@/lib/sessionVideos/sessionVideoCategories'
import type { SessionVideo } from '@/types/sessionVideo.types'

import { VideoCard } from './VideoCard'
import { VideoRow } from './VideoRow'

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span data-alt={alt} />,
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: ReactNode
    className?: string
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

const video: SessionVideo = {
  id: 'vid-1',
  title: 'React hooks deep dive',
  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  youtubeVideoId: 'dQw4w9WgXcQ',
  category: SESSION_VIDEO_CATEGORIES.REACT_SESSION,
  isFeatured: true,
  viewCount: 1,
  createdBy: 'admin@example.com',
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-02T00:00:00.000Z',
}

afterEach(() => {
  cleanup()
})

describe('VideoCard', () => {
  it('links to the secured watch page and shows category plus singular views', () => {
    render(<VideoCard video={video} />)

    expect(
      screen.getByRole('link', { name: /React hooks deep dive/ }),
    ).toHaveAttribute('href', '/secured/videos/vid-1')
    expect(screen.getByText('React Session')).toBeInTheDocument()
    expect(screen.getByText('1 view')).toBeInTheDocument()
    expect(
      document.querySelector('[data-alt="React hooks deep dive"]'),
    ).toBeTruthy()
  })
})

describe('VideoRow', () => {
  it('renders nothing when there are no videos', () => {
    const { container } = render(
      <VideoRow title="Featured" videos={[]} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('lists each video under the section title', () => {
    render(<VideoRow title="Featured" videos={[video]} />)

    expect(
      screen.getByRole('heading', { name: 'Featured' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /React hooks deep dive/ }),
    ).toHaveAttribute('href', '/secured/videos/vid-1')
  })
})
