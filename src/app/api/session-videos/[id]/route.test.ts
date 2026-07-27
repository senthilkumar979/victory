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

import { GET as getCollection, POST as postCollection } from '../route'
import {
  DELETE as deleteVideo,
  GET as getVideo,
  PATCH as patchVideo,
} from './route'
import { POST as postView } from './view/route'

const video = {
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

const routeContext = {
  params: Promise.resolve({ id: 'video-1' }),
}

const validBody = {
  title: 'React Hooks Deep Dive',
  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  category: 'react_session',
  isFeatured: true,
}

function makeJsonRequest(url: string, method: string, body?: unknown) {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

describe('session-videos API routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAuthMock.mockResolvedValue({
      context: { user: { id: 'admin-1' }, email: 'admin@example.com' },
    })
    isAdminUserMock.mockReturnValue(true)
    listSessionVideosMock.mockResolvedValue([video])
    createSessionVideoMock.mockResolvedValue(video)
    getSessionVideoByIdMock.mockResolvedValue(video)
    updateSessionVideoMock.mockResolvedValue(video)
    deleteSessionVideoMock.mockResolvedValue(undefined)
    incrementSessionVideoViewCountMock.mockResolvedValue({
      ...video,
      viewCount: 5,
    })
  })

  it('GET /session-videos short-circuits on auth failure', async () => {
    const unauthorized = Response.json({ error: 'Unauthorized' }, { status: 401 })
    requireAuthMock.mockResolvedValue({ response: unauthorized })

    const response = await getCollection()

    expect(response).toBe(unauthorized)
    expect(listSessionVideosMock).not.toHaveBeenCalled()
  })

  it('GET /session-videos returns videos with admin flag', async () => {
    const response = await getCollection()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      videos: [video],
      isAdmin: true,
    })
  })

  it('POST /session-videos rejects non-admin callers', async () => {
    isAdminUserMock.mockReturnValue(false)

    const response = await postCollection(
      makeJsonRequest('http://localhost/api/session-videos', 'POST', validBody),
    )

    expect(response.status).toBe(403)
    expect(createSessionVideoMock).not.toHaveBeenCalled()
  })

  it('POST /session-videos validates the payload before creating', async () => {
    const response = await postCollection(
      makeJsonRequest('http://localhost/api/session-videos', 'POST', {
        ...validBody,
        youtubeUrl: 'https://vimeo.com/1',
      }),
    )

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Enter a valid YouTube video URL')
    expect(createSessionVideoMock).not.toHaveBeenCalled()
  })

  it('POST /session-videos creates with the authenticated admin email', async () => {
    const response = await postCollection(
      makeJsonRequest('http://localhost/api/session-videos', 'POST', validBody),
    )

    expect(createSessionVideoMock).toHaveBeenCalledWith({
      ...validBody,
      createdBy: 'admin@example.com',
    })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ video })
  })

  it('GET /session-videos/[id] returns 404 when the video is missing', async () => {
    getSessionVideoByIdMock.mockResolvedValue(null)

    const response = await getVideo(
      makeJsonRequest('http://localhost/api/session-videos/video-1', 'GET'),
      routeContext,
    )

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ error: 'Not found' })
  })

  it('PATCH /session-videos/[id] forbids non-admins and updates for admins', async () => {
    isAdminUserMock.mockReturnValue(false)
    const forbidden = await patchVideo(
      makeJsonRequest(
        'http://localhost/api/session-videos/video-1',
        'PATCH',
        validBody,
      ),
      routeContext,
    )
    expect(forbidden.status).toBe(403)
    expect(updateSessionVideoMock).not.toHaveBeenCalled()

    isAdminUserMock.mockReturnValue(true)
    const updated = await patchVideo(
      makeJsonRequest(
        'http://localhost/api/session-videos/video-1',
        'PATCH',
        validBody,
      ),
      routeContext,
    )
    expect(updateSessionVideoMock).toHaveBeenCalledWith('video-1', validBody)
    expect(updated.status).toBe(200)
  })

  it('DELETE /session-videos/[id] deletes for admins only', async () => {
    isAdminUserMock.mockReturnValue(false)
    const forbidden = await deleteVideo(
      makeJsonRequest('http://localhost/api/session-videos/video-1', 'DELETE'),
      routeContext,
    )
    expect(forbidden.status).toBe(403)
    expect(deleteSessionVideoMock).not.toHaveBeenCalled()

    isAdminUserMock.mockReturnValue(true)
    const deleted = await deleteVideo(
      makeJsonRequest('http://localhost/api/session-videos/video-1', 'DELETE'),
      routeContext,
    )
    expect(deleteSessionVideoMock).toHaveBeenCalledWith('video-1')
    expect(deleted.status).toBe(200)
    await expect(deleted.json()).resolves.toEqual({ success: true })
  })

  it('POST /session-videos/[id]/view records a view or 404s', async () => {
    const recorded = await postView(
      makeJsonRequest('http://localhost/api/session-videos/video-1/view', 'POST'),
      routeContext,
    )
    expect(incrementSessionVideoViewCountMock).toHaveBeenCalledWith('video-1')
    expect(recorded.status).toBe(200)
    await expect(recorded.json()).resolves.toEqual({
      video: { ...video, viewCount: 5 },
    })

    incrementSessionVideoViewCountMock.mockResolvedValueOnce(null)
    const missing = await postView(
      makeJsonRequest('http://localhost/api/session-videos/video-1/view', 'POST'),
      routeContext,
    )
    expect(missing.status).toBe(404)
  })
})
