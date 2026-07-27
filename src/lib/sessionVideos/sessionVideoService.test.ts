import { beforeEach, describe, expect, it, vi } from 'vitest'

const { dbState } = vi.hoisted(() => ({
  dbState: {
    client: {
      from: vi.fn(),
    } as { from: ReturnType<typeof vi.fn> } | null,
  },
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/supabaseAdmin', () => ({
  get supabaseAdmin() {
    return dbState.client
  },
}))

import {
  createSessionVideo,
  deleteSessionVideo,
  getSessionVideoById,
  incrementSessionVideoViewCount,
  listSessionVideos,
  updateSessionVideo,
} from './sessionVideoService'

const videoRow = {
  id: 'video-1',
  title: 'React Hooks Deep Dive',
  youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  youtube_video_id: 'dQw4w9WgXcQ',
  category: 'react_session',
  is_featured: true,
  view_count: 4,
  created_by: 'admin@example.com',
  created_at: '2026-07-01T00:00:00.000Z',
  updated_at: '2026-07-02T00:00:00.000Z',
}

const mappedVideo = {
  id: 'video-1',
  title: 'React Hooks Deep Dive',
  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  youtubeVideoId: 'dQw4w9WgXcQ',
  category: 'react_session',
  isFeatured: true,
  viewCount: 4,
  createdBy: 'admin@example.com',
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-02T00:00:00.000Z',
}

function createListQuery(result: {
  data: Record<string, unknown>[] | null
  error: { message: string } | null
}) {
  const order = vi.fn().mockResolvedValue(result)
  const select = vi.fn().mockReturnValue({ order })
  const from = vi.fn().mockReturnValue({ select })
  return { from, select, order }
}

function createGetQuery(result: {
  data: Record<string, unknown> | null
  error: { message: string } | null
}) {
  const maybeSingle = vi.fn().mockResolvedValue(result)
  const eq = vi.fn().mockReturnValue({ maybeSingle })
  const select = vi.fn().mockReturnValue({ eq })
  const from = vi.fn().mockReturnValue({ select })
  return { from, select, eq, maybeSingle }
}

function createInsertQuery(result: {
  data: Record<string, unknown> | null
  error: { message: string } | null
}) {
  const single = vi.fn().mockResolvedValue(result)
  const select = vi.fn().mockReturnValue({ single })
  const insert = vi.fn().mockReturnValue({ select })
  const from = vi.fn().mockReturnValue({ insert })
  return { from, insert, select, single }
}

function createUpdateQuery(result: {
  data: Record<string, unknown> | null
  error: { message: string } | null
}) {
  const single = vi.fn().mockResolvedValue(result)
  const select = vi.fn().mockReturnValue({ single })
  const eq = vi.fn().mockReturnValue({ select })
  const update = vi.fn().mockReturnValue({ eq })
  const from = vi.fn().mockReturnValue({ update })
  return { from, update, eq, select, single }
}

describe('sessionVideoService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dbState.client = { from: vi.fn() }
  })

  it('lists session videos newest first and maps snake_case rows', async () => {
    const { from, select, order } = createListQuery({
      data: [videoRow],
      error: null,
    })
    dbState.client = { from }

    await expect(listSessionVideos()).resolves.toEqual([mappedVideo])
    expect(from).toHaveBeenCalledWith('session_videos')
    expect(select).toHaveBeenCalledWith('*')
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('returns null when a video id does not exist', async () => {
    const { from, eq } = createGetQuery({ data: null, error: null })
    dbState.client = { from }

    await expect(getSessionVideoById('missing')).resolves.toBeNull()
    expect(eq).toHaveBeenCalledWith('id', 'missing')
  })

  it('creates a video after extracting the YouTube id', async () => {
    const { from, insert } = createInsertQuery({
      data: videoRow,
      error: null,
    })
    dbState.client = { from }

    await expect(
      createSessionVideo({
        title: 'React Hooks Deep Dive',
        youtubeUrl: 'https://youtu.be/dQw4w9WgXcQ',
        category: 'react_session',
        isFeatured: true,
        createdBy: 'admin@example.com',
      }),
    ).resolves.toEqual(mappedVideo)

    expect(insert).toHaveBeenCalledWith({
      title: 'React Hooks Deep Dive',
      youtube_url: 'https://youtu.be/dQw4w9WgXcQ',
      youtube_video_id: 'dQw4w9WgXcQ',
      category: 'react_session',
      is_featured: true,
      created_by: 'admin@example.com',
    })
  })

  it('rejects create and update when the YouTube URL is invalid', async () => {
    const from = vi.fn()
    dbState.client = { from }

    await expect(
      createSessionVideo({
        title: 'Bad URL',
        youtubeUrl: 'https://vimeo.com/123',
        category: 'chit_chat',
        isFeatured: false,
        createdBy: 'admin@example.com',
      }),
    ).rejects.toThrow('Invalid YouTube URL')

    await expect(
      updateSessionVideo('video-1', {
        title: 'Bad URL',
        youtubeUrl: 'not-a-url',
        category: 'chit_chat',
        isFeatured: false,
      }),
    ).rejects.toThrow('Invalid YouTube URL')

    expect(from).not.toHaveBeenCalled()
  })

  it('updates an existing video and remaps the returned row', async () => {
    const updatedRow = {
      ...videoRow,
      title: 'Updated title',
      is_featured: false,
    }
    const { from, update, eq } = createUpdateQuery({
      data: updatedRow,
      error: null,
    })
    dbState.client = { from }

    await expect(
      updateSessionVideo('video-1', {
        title: 'Updated title',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        category: 'react_session',
        isFeatured: false,
      }),
    ).resolves.toMatchObject({
      id: 'video-1',
      title: 'Updated title',
      isFeatured: false,
    })

    expect(update).toHaveBeenCalledWith({
      title: 'Updated title',
      youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      youtube_video_id: 'dQw4w9WgXcQ',
      category: 'react_session',
      is_featured: false,
    })
    expect(eq).toHaveBeenCalledWith('id', 'video-1')
  })

  it('deletes a video by id', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const del = vi.fn().mockReturnValue({ eq })
    const from = vi.fn().mockReturnValue({ delete: del })
    dbState.client = { from }

    await expect(deleteSessionVideo('video-1')).resolves.toBeUndefined()
    expect(from).toHaveBeenCalledWith('session_videos')
    expect(eq).toHaveBeenCalledWith('id', 'video-1')
  })

  it('increments view count from the current value and returns null when missing', async () => {
    const getQuery = createGetQuery({ data: videoRow, error: null })
    const updateQuery = createUpdateQuery({
      data: { ...videoRow, view_count: 5 },
      error: null,
    })
    const from = vi
      .fn()
      .mockReturnValueOnce({ select: getQuery.select })
      .mockReturnValueOnce({ update: updateQuery.update })
    dbState.client = { from }

    await expect(incrementSessionVideoViewCount('video-1')).resolves.toMatchObject(
      {
        id: 'video-1',
        viewCount: 5,
      },
    )
    expect(updateQuery.update).toHaveBeenCalledWith({ view_count: 5 })

    const missingQuery = createGetQuery({ data: null, error: null })
    dbState.client = { from: missingQuery.from }

    await expect(incrementSessionVideoViewCount('missing')).resolves.toBeNull()
  })

  it('throws when the server database client is not configured', async () => {
    dbState.client = null

    await expect(listSessionVideos()).rejects.toThrow(
      'Server database is not configured.',
    )
  })
})
