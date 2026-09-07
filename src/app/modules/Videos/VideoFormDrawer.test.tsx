import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SESSION_VIDEO_CATEGORIES } from '@/lib/sessionVideos/sessionVideoCategories'

import { VideoFormDrawer } from './VideoFormDrawer'

const { successToastMock, errorToastMock } = vi.hoisted(() => ({
  successToastMock: vi.fn(),
  errorToastMock: vi.fn(),
}))

vi.mock('goey-toast', () => ({
  gooeyToast: { success: successToastMock, error: errorToastMock },
}))
vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span data-alt={alt} />,
}))
vi.mock('@/ui/organisms/drawer/Drawer', () => {
  const Root = ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? <section>{children}</section> : null
  const Slot = ({ children }: { children: ReactNode }) => <>{children}</>
  return { Drawer: Object.assign(Root, { Title: Slot, Body: Slot, Footer: Slot }) }
})

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

async function fillVideoForm(title: string) {
  const user = userEvent.setup()
  await user.type(screen.getByPlaceholderText('Session title'), title)
  await user.type(
    screen.getByPlaceholderText('https://www.youtube.com/watch?v=...'),
    YOUTUBE_URL,
  )
  return user
}

afterEach(() => {
  cleanup()
})

describe('VideoFormDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'vid-new' }) }),
    )
  })

  it('POSTs a new video and PATCHes when editing', async () => {
    const onSuccess = vi.fn()
    const { rerender } = render(
      <VideoFormDrawer isOpen onClose={vi.fn()} onSuccess={onSuccess} />,
    )

    const user = await fillVideoForm('New session')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
    expect(fetch).toHaveBeenCalledWith(
      '/api/session-videos',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          title: 'New session',
          youtubeUrl: YOUTUBE_URL,
          category: SESSION_VIDEO_CATEGORIES.GENERAL_SESSION,
          isFeatured: true,
        }),
      }),
    )

    rerender(
      <VideoFormDrawer
        isOpen
        videoToEdit={{
          id: 'vid-1',
          title: 'React hooks deep dive',
          youtubeUrl: YOUTUBE_URL,
          category: SESSION_VIDEO_CATEGORIES.REACT_SESSION,
          isFeatured: false,
        }}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    )
    await waitFor(() =>
      expect(screen.getByPlaceholderText('Session title')).toHaveValue(
        'React hooks deep dive',
      ),
    )
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(2))
    expect(fetch).toHaveBeenCalledWith(
      '/api/session-videos/vid-1',
      expect.objectContaining({ method: 'PATCH' }),
    )
  })

  it('toasts API errors and skips onSuccess', async () => {
    const onSuccess = vi.fn()
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Not allowed' }),
    } as Response)

    render(<VideoFormDrawer isOpen onClose={vi.fn()} onSuccess={onSuccess} />)
    const user = await fillVideoForm('Blocked')
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => expect(errorToastMock).toHaveBeenCalledTimes(1))
    expect(errorToastMock).toHaveBeenCalledWith(
      'Failed to save video.',
      expect.objectContaining({ description: 'Not allowed' }),
    )
    expect(onSuccess).not.toHaveBeenCalled()
    expect(successToastMock).not.toHaveBeenCalled()
  })
})
