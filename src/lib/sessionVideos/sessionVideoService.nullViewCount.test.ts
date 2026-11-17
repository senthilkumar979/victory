import { beforeEach, describe, expect, it, vi } from 'vitest'

const { dbState } = vi.hoisted(() => ({
  dbState: {
    client: { from: vi.fn() } as { from: ReturnType<typeof vi.fn> } | null,
  },
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/supabaseAdmin', () => ({
  get supabaseAdmin() {
    return dbState.client
  },
}))

import {
  incrementSessionVideoViewCount,
  listSessionVideos,
} from './sessionVideoService'

const videoRow = {
  id: 'video-1',
  title: 'Intro',
  youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  youtube_video_id: 'dQw4w9WgXcQ',
  category: 'react_session',
  is_featured: false,
  created_by: 'admin@example.com',
  created_at: '2026-07-01T00:00:00.000Z',
  updated_at: '2026-07-02T00:00:00.000Z',
}

describe('session video missing view counts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dbState.client = { from: vi.fn() }
  })

  it('maps a missing view count to zero', async () => {
    const order = vi.fn().mockResolvedValue({ data: [videoRow], error: null })
    const select = vi.fn().mockReturnValue({ order })
    dbState.client = { from: vi.fn().mockReturnValue({ select }) }

    await expect(listSessionVideos()).resolves.toMatchObject([
      { id: 'video-1', viewCount: 0 },
    ])
  })

  it('increments a missing view count from zero instead of writing NaN', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: videoRow, error: null })
    const selectGet = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({ maybeSingle }),
    })
    const single = vi.fn().mockResolvedValue({
      data: { ...videoRow, view_count: 1 },
      error: null,
    })
    const update = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({ single }),
      }),
    })
    const from = vi
      .fn()
      .mockReturnValueOnce({ select: selectGet })
      .mockReturnValueOnce({ update })
    dbState.client = { from }

    await expect(incrementSessionVideoViewCount('video-1')).resolves.toMatchObject({
      id: 'video-1',
      viewCount: 1,
    })
    expect(update).toHaveBeenCalledWith({ view_count: 1 })
  })
})
