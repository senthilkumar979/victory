import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SESSION_VIDEO_CATEGORIES } from '@/lib/sessionVideos/sessionVideoCategories'
import type { SessionVideo, SessionVideoFormState } from '@/types/sessionVideo.types'

import { VideosList } from './VideosList'

const hookState = {
  videos: [] as SessionVideo[],
  isAdmin: false,
  isLoading: false,
  error: null as string | null,
  refetch: vi.fn(),
}

vi.mock('@/hooks/useSessionVideos', () => ({
  useSessionVideos: () => hookState,
}))

vi.mock('./VideoFormDrawer', () => ({
  VideoFormDrawer: ({
    isOpen, videoToEdit, onSuccess,
  }: {
    isOpen: boolean
    videoToEdit?: SessionVideoFormState
    onSuccess: () => void
  }) => isOpen ? (
    <div>
      <p>form-mode:{videoToEdit?.id ?? 'create'}</p>
      <p>form-title:{videoToEdit?.title ?? ''}</p>
      <p>form-category:{videoToEdit?.category ?? ''}</p>
      <p>form-featured:{String(videoToEdit?.isFeatured ?? '')}</p>
      <button type="button" onClick={onSuccess}>Complete save</button>
    </div>
  ) : null,
}))

vi.mock('./DeleteVideo', () => ({
  DeleteVideo: ({ show, video, onDeleted }: {
    show: boolean
    video: SessionVideo | null
    onDeleted: () => void
  }) => show ? (
    <div>
      <p>delete:{video?.title ?? 'none'}</p>
      <button type="button" onClick={onDeleted}>Confirm delete</button>
    </div>
  ) : null,
}))

const olderVideo: SessionVideo = {
  id: 'video-old',
  title: 'Older session',
  youtubeUrl: 'https://www.youtube.com/watch?v=aaaaaaaaaaa',
  youtubeVideoId: 'aaaaaaaaaaa',
  category: SESSION_VIDEO_CATEGORIES.GENERAL_SESSION,
  isFeatured: false,
  viewCount: 2,
  createdBy: 'admin@example.com',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const featuredVideo: SessionVideo = {
  ...olderVideo,
  id: 'video-1',
  title: 'React hooks deep dive',
  category: SESSION_VIDEO_CATEGORIES.REACT_SESSION,
  isFeatured: true,
  createdAt: '2026-07-01T00:00:00.000Z',
}

function rowButtons(title: string) {
  const row = screen.getByText(title).closest('div.flex.flex-wrap')
  if (!(row instanceof HTMLElement)) throw new Error(`row missing for ${title}`)
  return within(row).queryAllByRole('button')
}

beforeEach(() => {
  hookState.videos = []
  hookState.isAdmin = false
  hookState.isLoading = false
  hookState.error = null
  hookState.refetch.mockReset()
})

afterEach(() => {
  cleanup()
})

describe('VideosList', () => {
  it('hides create and row actions for members', () => {
    hookState.videos = [featuredVideo]
    render(<VideosList />)
    expect(screen.queryByRole('button', { name: /Add video/i })).not.toBeInTheDocument()
    expect(rowButtons('React hooks deep dive')).toEqual([])
  })

  it('shows admin CRUD when adminPanel is set even if the hook is not admin', async () => {
    const user = userEvent.setup()
    hookState.videos = [featuredVideo]
    render(<VideosList adminPanel />)
    await user.click(screen.getByRole('button', { name: /Add video/i }))
    expect(screen.getByText('form-mode:create')).toBeInTheDocument()
  })

  it('maps edit fields including category and featured, then refetches on save', async () => {
    const user = userEvent.setup()
    hookState.isAdmin = true
    hookState.videos = [featuredVideo, olderVideo]
    render(<VideosList />)

    expect(
      screen.getByText('React hooks deep dive').compareDocumentPosition(
        screen.getByText('Older session'),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()

    await user.click(rowButtons('React hooks deep dive')[0])
    expect(screen.getByText('form-mode:video-1')).toBeInTheDocument()
    expect(screen.getByText('form-title:React hooks deep dive')).toBeInTheDocument()
    expect(screen.getByText('form-category:react_session')).toBeInTheDocument()
    expect(screen.getByText('form-featured:true')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Complete save' }))
    expect(hookState.refetch).toHaveBeenCalled()
  })

  it('opens delete with the selected video and refetches after confirm', async () => {
    const user = userEvent.setup()
    hookState.isAdmin = true
    hookState.videos = [featuredVideo]
    render(<VideosList />)
    await user.click(rowButtons('React hooks deep dive')[1])
    expect(screen.getByText('delete:React hooks deep dive')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Confirm delete' }))
    expect(hookState.refetch).toHaveBeenCalled()
  })

  it('shows error copy instead of the empty state', () => {
    hookState.error = 'Failed to load videos'
    render(<VideosList />)
    expect(screen.getByText('Failed to load videos')).toBeInTheDocument()
    expect(screen.queryByText('No videos yet.')).not.toBeInTheDocument()
  })
})
