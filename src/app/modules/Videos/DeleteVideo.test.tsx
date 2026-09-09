import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SESSION_VIDEO_CATEGORIES } from '@/lib/sessionVideos/sessionVideoCategories'
import type { SessionVideo } from '@/types/sessionVideo.types'

import { DeleteVideo } from './DeleteVideo'

const { successToastMock, errorToastMock } = vi.hoisted(() => ({
  successToastMock: vi.fn(),
  errorToastMock: vi.fn(),
}))

vi.mock('goey-toast', () => ({
  gooeyToast: { success: successToastMock, error: errorToastMock },
}))

function makeVideo(overrides: Partial<SessionVideo> = {}): SessionVideo {
  return {
    id: 'vid-1',
    title: 'React hooks deep dive',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeVideoId: 'dQw4w9WgXcQ',
    category: SESSION_VIDEO_CATEGORIES.REACT_SESSION,
    isFeatured: false,
    viewCount: 12,
    createdBy: 'admin-1',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('DeleteVideo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      }),
    )
  })

  it('renders nothing when hidden or the video is missing', () => {
    const { container: hidden } = render(
      <DeleteVideo
        show={false}
        video={makeVideo()}
        onClose={vi.fn()}
        onDeleted={vi.fn()}
      />,
    )
    expect(hidden).toBeEmptyDOMElement()

    cleanup()

    const { container: missing } = render(
      <DeleteVideo show video={null} onClose={vi.fn()} onDeleted={vi.fn()} />,
    )
    expect(missing).toBeEmptyDOMElement()
  })

  it('deletes by video id and notifies the parent', async () => {
    const user = userEvent.setup()
    const onDeleted = vi.fn()
    const onClose = vi.fn()

    render(
      <DeleteVideo
        show
        video={makeVideo()}
        onClose={onClose}
        onDeleted={onDeleted}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith('/api/session-videos/vid-1', {
        method: 'DELETE',
      }),
    )
    expect(successToastMock).toHaveBeenCalledTimes(1)
    expect(onDeleted).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('surfaces API body.error and falls back when the payload has no error', async () => {
    const user = userEvent.setup()
    const onDeleted = vi.fn()

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Video is featured' }),
    } as Response)

    render(
      <DeleteVideo
        show
        video={makeVideo()}
        onClose={vi.fn()}
        onDeleted={onDeleted}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(errorToastMock).toHaveBeenCalledWith(
        'Failed to delete video.',
        expect.objectContaining({ description: 'Video is featured' }),
      ),
    )
    expect(onDeleted).not.toHaveBeenCalled()

    cleanup()
    errorToastMock.mockClear()

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response)

    render(
      <DeleteVideo
        show
        video={makeVideo({ id: 'vid-2' })}
        onClose={vi.fn()}
        onDeleted={onDeleted}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(errorToastMock).toHaveBeenCalledWith(
        'Failed to delete video.',
        expect.objectContaining({ description: 'Delete failed' }),
      ),
    )
    expect(onDeleted).not.toHaveBeenCalled()
  })

  it('omits the error description when the reject is not an Error', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockRejectedValueOnce('network down')

    render(
      <DeleteVideo
        show
        video={makeVideo()}
        onClose={vi.fn()}
        onDeleted={vi.fn()}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(errorToastMock).toHaveBeenCalledWith(
        'Failed to delete video.',
        expect.objectContaining({ description: undefined }),
      ),
    )
  })
})
