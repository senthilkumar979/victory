import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { SessionVideo } from '@/types/sessionVideo.types'
import { SESSION_VIDEO_CATEGORIES } from '@/lib/sessionVideos/sessionVideoCategories'

const hooks = vi.hoisted(() => ({
  video: null as SessionVideo | null,
  isLoading: false,
  error: null as string | null,
  allVideos: [] as SessionVideo[],
  recordedIds: [] as Array<string | undefined>,
}))

vi.mock('@/hooks/useSessionVideo', () => ({
  useSessionVideo: () => ({
    video: hooks.video,
    isLoading: hooks.isLoading,
    error: hooks.error,
    refetch: async () => {},
  }),
}))

vi.mock('@/hooks/useSessionVideos', () => ({
  useSessionVideos: () => ({
    videos: hooks.allVideos,
    isLoading: false,
    error: null,
    refetch: async () => {},
  }),
}))

vi.mock('@/hooks/useRecordVideoView', () => ({
  useRecordVideoView: (videoId?: string) => {
    hooks.recordedIds.push(videoId)
  },
}))

vi.mock('next/link', () => ({
  default: function LinkMock({
    href,
    children,
  }: {
    href: string
    children: React.ReactNode
  }) {
    return <a href={href}>{children}</a>
  },
}))

vi.mock('@/components/video/YouTubeEmbed', () => ({
  YouTubeEmbed: function YouTubeEmbedMock({
    videoId,
    title,
  }: {
    videoId: string
    title: string
  }) {
    return <div>{`embed ${videoId} ${title}`}</div>
  },
}))

vi.mock('@/components/video/VideoCard', () => ({
  VideoCard: function VideoCardMock({ video }: { video: SessionVideo }) {
    return <div>{`similar ${video.title}`}</div>
  },
}))

import { VideosWatchPage } from './VideosWatchPage'

function makeVideo(overrides: Partial<SessionVideo> = {}): SessionVideo {
  return {
    id: 'vid-1',
    title: 'React hooks',
    youtubeUrl: 'https://www.youtube.com/watch?v=abc',
    youtubeVideoId: 'abc',
    category: SESSION_VIDEO_CATEGORIES.REACT_SESSION,
    isFeatured: false,
    viewCount: 12,
    createdBy: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
  hooks.video = null
  hooks.isLoading = false
  hooks.error = null
  hooks.allVideos = []
  hooks.recordedIds = []
})

describe('VideosWatchPage', () => {
  it('falls back to Video not found and does not record a view without a video', () => {
    render(<VideosWatchPage videoId="missing" />)

    expect(screen.getByText('Video not found.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Back to videos/ })).toHaveAttribute(
      'href',
      '/secured/videos',
    )
    expect(hooks.recordedIds).toEqual([undefined])
  })

  it('prefers the fetch error over the not-found copy', () => {
    hooks.error = 'You do not have access to this video'
    render(<VideosWatchPage videoId="vid-1" />)

    expect(
      screen.getByText('You do not have access to this video'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Video not found.')).not.toBeInTheDocument()
  })

  it('records the watch with the loaded video id and lists same-category videos first', () => {
    const current = makeVideo()
    hooks.video = current
    hooks.allVideos = [
      current,
      makeVideo({
        id: 'other-cat',
        title: 'Java intro',
        category: SESSION_VIDEO_CATEGORIES.JAVA_SESSION,
      }),
      makeVideo({ id: 'same-cat', title: 'React effects' }),
    ]

    render(<VideosWatchPage videoId="vid-1" />)

    expect(hooks.recordedIds).toEqual(['vid-1'])
    expect(screen.getByText('embed abc React hooks')).toBeInTheDocument()
    const similar = screen.getAllByText(/similar /).map((el) => el.textContent)
    expect(similar[0]).toBe('similar React effects')
  })
})
