import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  requireAuthMock,
  isAdminUserMock,
  listSessionVideosMock,
  createSessionVideoMock,
  getSessionVideoByIdMock,
  updateSessionVideoMock,
  deleteSessionVideoMock,
  incrementSessionVideoViewCountMock,
} = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  isAdminUserMock: vi.fn(),
  listSessionVideosMock: vi.fn(),
  createSessionVideoMock: vi.fn(),
  getSessionVideoByIdMock: vi.fn(),
  updateSessionVideoMock: vi.fn(),
  deleteSessionVideoMock: vi.fn(),
  incrementSessionVideoViewCountMock: vi.fn(),
}))

vi.mock('@/lib/auth/requireAuth', () => ({
  requireAuth: requireAuthMock,
}))

vi.mock('@/lib/auth/clerkUser', () => ({
  isAdminUser: isAdminUserMock,
}))

vi.mock('@/lib/sessionVideos/sessionVideoService', () => ({
  listSessionVideos: listSessionVideosMock,
  createSessionVideo: createSessionVideoMock,
  getSessionVideoById: getSessionVideoByIdMock,
  updateSessionVideo: updateSessionVideoMock,
  deleteSessionVideo: deleteSessionVideoMock,
  incrementSessionVideoViewCount: incrementSessionVideoViewCountMock,
}))

import { GET as getCollection, POST as postCollection } from './route'
import { DELETE as deleteVideo, GET as getVideo, PATCH as patchVideo } from './[id]/route'
import { POST as postView } from './[id]/view/route'

const video = {
  id: 'video-1',
  title: 'React Hooks Deep Dive',
  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  youtubeVideoId: 'dQw4w9WgXcQ',
  category: 'react_session',
  isFeatured: false,
  viewCount: 0,
  createdBy: 'admin@example.com',
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-02T00:00:00.000Z',
}

const routeContext = {
  params: Promise.resolve({ id: 'video-1' }),
}

const validBody = {
  title: 'React Hooks Deep Dive',
  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  category: 'react_session',
  isFeatured: false,
}

function makeJsonRequest(url: string, method: string, body?: unknown) {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

describe('session video route failure contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    requireAuthMock.mockResolvedValue({
      context: { user: { id: 'member-1' }, email: 'member@example.com' },
    })
    isAdminUserMock.mockReturnValue(false)
    listSessionVideosMock.mockResolvedValue([video])
    getSessionVideoByIdMock.mockResolvedValue(video)
    createSessionVideoMock.mockResolvedValue(video)
    updateSessionVideoMock.mockResolvedValue(video)
    deleteSessionVideoMock.mockResolvedValue(undefined)
    incrementSessionVideoViewCountMock.mockResolvedValue(video)
  })

  it('GET /session-videos reports a non-admin viewer and hides list failures', async () => {
    const listed = await getCollection()

    expect(listed.status).toBe(200)
    await expect(listed.json()).resolves.toEqual({
      videos: [video],
      isAdmin: false,
    })

    listSessionVideosMock.mockRejectedValueOnce(
      new Error('relation session_videos does not exist'),
    )
    const failed = await getCollection()

    expect(failed.status).toBe(500)
    await expect(failed.json()).resolves.toEqual({
      error: 'Could not load videos.',
    })
  })

  it('POST /session-videos stops on auth failure and maps thrown errors', async () => {
    const unauthorized = Response.json({ error: 'Unauthorized' }, { status: 401 })
    requireAuthMock.mockResolvedValueOnce({ response: unauthorized })

    const blocked = await postCollection(
      makeJsonRequest('http://localhost/api/session-videos', 'POST', validBody),
    )

    expect(blocked).toBe(unauthorized)
    expect(createSessionVideoMock).not.toHaveBeenCalled()

    isAdminUserMock.mockReturnValue(true)
    createSessionVideoMock.mockRejectedValueOnce(new Error('duplicate key'))
    const leaked = await postCollection(
      makeJsonRequest('http://localhost/api/session-videos', 'POST', validBody),
    )
    expect(leaked.status).toBe(500)
    await expect(leaked.json()).resolves.toEqual({ error: 'duplicate key' })

    createSessionVideoMock.mockRejectedValueOnce('nope')
    const generic = await postCollection(
      makeJsonRequest('http://localhost/api/session-videos', 'POST', validBody),
    )
    expect(generic.status).toBe(500)
    await expect(generic.json()).resolves.toEqual({
      error: 'Could not create video.',
    })
  })

  it('GET /session-videos/[id] returns the video for members and hides load failures', async () => {
    const loaded = await getVideo(
      makeJsonRequest('http://localhost/api/session-videos/video-1', 'GET'),
      routeContext,
    )

    expect(loaded.status).toBe(200)
    await expect(loaded.json()).resolves.toEqual({
      video,
      isAdmin: false,
    })

    getSessionVideoByIdMock.mockRejectedValueOnce(new Error('timeout'))
    const failed = await getVideo(
      makeJsonRequest('http://localhost/api/session-videos/video-1', 'GET'),
      routeContext,
    )
    expect(failed.status).toBe(500)
    await expect(failed.json()).resolves.toEqual({ error: 'Could not load video.' })
  })

  it('PATCH /session-videos/[id] validates before update and keeps Error messages', async () => {
    isAdminUserMock.mockReturnValue(true)

    const invalid = await patchVideo(
      makeJsonRequest('http://localhost/api/session-videos/video-1', 'PATCH', {
        ...validBody,
        title: '   ',
      }),
      routeContext,
    )

    expect(invalid.status).toBe(400)
    await expect(invalid.json()).resolves.toEqual({ error: 'Title is required' })
    expect(updateSessionVideoMock).not.toHaveBeenCalled()

    updateSessionVideoMock.mockRejectedValueOnce(new Error('row locked'))
    const leaked = await patchVideo(
      makeJsonRequest('http://localhost/api/session-videos/video-1', 'PATCH', validBody),
      routeContext,
    )
    expect(leaked.status).toBe(500)
    await expect(leaked.json()).resolves.toEqual({ error: 'row locked' })

    updateSessionVideoMock.mockRejectedValueOnce(null)
    const generic = await patchVideo(
      makeJsonRequest('http://localhost/api/session-videos/video-1', 'PATCH', validBody),
      routeContext,
    )
    expect(generic.status).toBe(500)
    await expect(generic.json()).resolves.toEqual({
      error: 'Could not update video.',
    })
  })

  it('DELETE /session-videos/[id] hides the underlying error message', async () => {
    isAdminUserMock.mockReturnValue(true)
    deleteSessionVideoMock.mockRejectedValueOnce(new Error('fk violation'))

    const failed = await deleteVideo(
      makeJsonRequest('http://localhost/api/session-videos/video-1', 'DELETE'),
      routeContext,
    )

    expect(failed.status).toBe(500)
    await expect(failed.json()).resolves.toEqual({
      error: 'Could not delete video.',
    })
  })

  it('POST /session-videos/[id]/view stops on auth failure and hides record failures', async () => {
    const unauthorized = Response.json({ error: 'Unauthorized' }, { status: 401 })
    requireAuthMock.mockResolvedValueOnce({ response: unauthorized })

    const blocked = await postView(
      makeJsonRequest('http://localhost/api/session-videos/video-1/view', 'POST'),
      routeContext,
    )

    expect(blocked).toBe(unauthorized)
    expect(incrementSessionVideoViewCountMock).not.toHaveBeenCalled()

    incrementSessionVideoViewCountMock.mockRejectedValueOnce(new Error('deadlock'))
    const failed = await postView(
      makeJsonRequest('http://localhost/api/session-videos/video-1/view', 'POST'),
      routeContext,
    )
    expect(failed.status).toBe(500)
    await expect(failed.json()).resolves.toEqual({
      error: 'Could not record view.',
    })
  })
})
