import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { authMock, copyMock, delMock, supabaseState } = vi.hoisted(() => ({
  authMock: vi.fn(),
  copyMock: vi.fn(),
  delMock: vi.fn(),
  supabaseState: { client: null as unknown },
}))

vi.mock('server-only', () => ({}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: authMock,
}))

vi.mock('@vercel/blob', () => ({
  copy: (...args: unknown[]) => copyMock(...args),
  del: (...args: unknown[]) => delMock(...args),
}))

vi.mock('@/lib/supabaseClient', () => ({
  get supabase() {
    return supabaseState.client
  },
}))

import { POST } from './route'

function makeJsonRequest(
  body: unknown,
  meetingId = 'meeting-1',
  rawBody?: string,
) {
  return {
    request: new Request(
      `http://localhost/api/meetings/${meetingId}/cover-image/confirm`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: rawBody ?? JSON.stringify(body),
      },
    ),
    context: { params: Promise.resolve({ id: meetingId }) },
  }
}

describe('POST /api/meetings/[id]/cover-image/confirm', () => {
  const eq = vi.fn()
  const update = vi.fn()
  const from = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'blob-token')
    authMock.mockResolvedValue({ userId: 'user-1' })
    eq.mockResolvedValue({ error: null })
    update.mockReturnValue({ eq })
    from.mockReturnValue({ update })
    supabaseState.client = { from }
    copyMock.mockResolvedValue({ url: 'https://blob.example/meeting-1.webp' })
    delMock.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns 401 when the caller is unauthenticated', async () => {
    authMock.mockResolvedValue({ userId: null })
    const { request, context } = makeJsonRequest({
      previewPathname: 'previews/tmp.webp',
    })

    const response = await POST(request as never, context)

    expect(response.status).toBe(401)
    expect(copyMock).not.toHaveBeenCalled()
  })

  it('returns 503 when blob storage is not configured', async () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', ' ')
    const { request, context } = makeJsonRequest({
      previewPathname: 'previews/tmp.webp',
    })

    const response = await POST(request as never, context)

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      error: 'Blob storage is not configured',
    })
  })

  it('rejects invalid ids, invalid JSON, and missing preview pathnames', async () => {
    const invalidId = await POST(
      makeJsonRequest({ previewPathname: 'previews/tmp.webp' }, '').request as never,
      makeJsonRequest({ previewPathname: 'previews/tmp.webp' }, '').context,
    )
    expect(invalidId.status).toBe(400)

    const invalidJson = await POST(
      makeJsonRequest({}, 'meeting-1', '{').request as never,
      makeJsonRequest({}, 'meeting-1', '{').context,
    )
    expect(invalidJson.status).toBe(400)
    await expect(invalidJson.json()).resolves.toEqual({
      error: 'Invalid JSON body',
    })

    const missingPath = await POST(
      makeJsonRequest({ previewPathname: 12 }).request as never,
      makeJsonRequest({ previewPathname: 12 }).context,
    )
    expect(missingPath.status).toBe(400)
    await expect(missingPath.json()).resolves.toEqual({
      error: 'Missing previewPathname',
    })
    expect(copyMock).not.toHaveBeenCalled()
  })

  it('copies the preview onto the meeting id and updates the cover URL', async () => {
    const { request, context } = makeJsonRequest({
      previewPathname: 'previews/tmp.webp',
    })

    const response = await POST(request as never, context)

    expect(copyMock).toHaveBeenCalledWith(
      'previews/tmp.webp',
      'meeting-1.webp',
      {
        access: 'public',
        token: 'blob-token',
        allowOverwrite: true,
      },
    )
    expect(delMock).toHaveBeenCalledWith('previews/tmp.webp', {
      token: 'blob-token',
    })
    expect(update).toHaveBeenCalledWith({
      cover_image_url: 'https://blob.example/meeting-1.webp',
    })
    expect(eq).toHaveBeenCalledWith('id', 'meeting-1')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      coverImageUrl: 'https://blob.example/meeting-1.webp',
    })
  })

  it('still succeeds when preview deletion is best-effort and fails', async () => {
    delMock.mockRejectedValueOnce(new Error('already gone'))
    const { request, context } = makeJsonRequest({
      previewPathname: 'previews/tmp.png',
    })

    const response = await POST(request as never, context)

    expect(copyMock).toHaveBeenCalledWith(
      'previews/tmp.png',
      'meeting-1.png',
      expect.any(Object),
    )
    expect(response.status).toBe(200)
  })

  it('returns 502 when the meeting row cannot be updated', async () => {
    eq.mockResolvedValueOnce({ error: { message: 'db down' } })
    const { request, context } = makeJsonRequest({
      previewPathname: 'previews/tmp.webp',
    })

    const response = await POST(request as never, context)

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({
      error: 'Image saved but failed to update meeting',
    })
  })
})
