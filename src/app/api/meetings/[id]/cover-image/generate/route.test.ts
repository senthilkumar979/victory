import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  authMock,
  generateMock,
  putMock,
  delMock,
  supabaseState,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  generateMock: vi.fn(),
  putMock: vi.fn(),
  delMock: vi.fn(),
  supabaseState: { client: null as unknown },
}))

vi.mock('server-only', () => ({}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: authMock,
}))

vi.mock('@vercel/blob', () => ({
  put: (...args: unknown[]) => putMock(...args),
  del: (...args: unknown[]) => delMock(...args),
}))

vi.mock('@/lib/supabaseClient', () => ({
  get supabase() {
    return supabaseState.client
  },
}))

vi.mock('@/lib/meetingCoverImageGeneration', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@/lib/meetingCoverImageGeneration')>()
  return {
    ...original,
    generateMeetingCoverImageWithGemini: generateMock,
  }
})

vi.mock('@/app/modules/Meetings/meetingCoverPrompt', () => ({
  buildDefaultMeetingCoverPrompt: () => 'DEFAULT_PROMPT',
  getMentorBridgeLogoUrl: () => 'https://example.com/logo.png',
}))

import { GeminiImageGenerationError } from '@/lib/meetingCoverImageGeneration'

import { POST } from './route'

const meetingRow = {
  id: 'meeting-1',
  title: 'Weekly sync',
  date: '2026-08-20T12:00:00.000Z',
  google_group_id: 'g1',
  description: 'Agenda',
  meeting_link: 'https://meet.example',
  cover_image_url: '',
}

function mockMeetingQuery(result: {
  data: typeof meetingRow | null
  error: { message: string } | null
}) {
  const maybeSingle = vi.fn().mockResolvedValue(result)
  const eq = vi.fn().mockReturnValue({ maybeSingle })
  const select = vi.fn().mockReturnValue({ eq })
  const from = vi.fn().mockReturnValue({ select })
  supabaseState.client = { from }
  return { from }
}

function makeRequest(body?: unknown) {
  return new Request('http://localhost/api/meetings/meeting-1/cover-image/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

describe('POST /api/meetings/[id]/cover-image/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue({ userId: 'user-1' })
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'blob-token')
    mockMeetingQuery({ data: meetingRow, error: null })
    generateMock.mockResolvedValue({
      imageBase64: Buffer.from('img').toString('base64'),
      mimeType: 'image/png',
    })
    putMock.mockResolvedValue({
      url: 'https://blob.example/preview.png',
      pathname: 'meetings/preview/meeting-1.png',
    })
    delMock.mockResolvedValue(undefined)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'image/png' },
        arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
      }),
    )
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('returns 401 when the caller is unauthenticated', async () => {
    authMock.mockResolvedValue({ userId: null })

    const response = await POST(makeRequest({}), {
      params: Promise.resolve({ id: 'meeting-1' }),
    })

    expect(response.status).toBe(401)
    expect(generateMock).not.toHaveBeenCalled()
  })

  it('returns 503 when blob storage is not configured', async () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', '')

    const response = await POST(makeRequest({}), {
      params: Promise.resolve({ id: 'meeting-1' }),
    })

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      error: 'Blob storage is not configured',
    })
  })

  it('rejects an empty meeting id before looking up the row', async () => {
    const { from } = mockMeetingQuery({ data: meetingRow, error: null })

    const response = await POST(makeRequest({}), {
      params: Promise.resolve({ id: '   ' }),
    })

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid meeting id',
    })
    expect(from).not.toHaveBeenCalled()
  })

  it('returns 404 when the meeting does not exist', async () => {
    mockMeetingQuery({ data: null, error: null })

    const response = await POST(makeRequest({}), {
      params: Promise.resolve({ id: 'meeting-1' }),
    })

    expect(response.status).toBe(404)
    expect(generateMock).not.toHaveBeenCalled()
  })

  it('maps Gemini quota errors to 429', async () => {
    generateMock.mockRejectedValue(
      new GeminiImageGenerationError('Enable billing', 'quota'),
    )

    const response = await POST(makeRequest({}), {
      params: Promise.resolve({ id: 'meeting-1' }),
    })

    expect(response.status).toBe(429)
    await expect(response.json()).resolves.toEqual({
      error: 'Enable billing',
    })
    expect(putMock).not.toHaveBeenCalled()
  })

  it('stores a generated preview using the default prompt', async () => {
    const response = await POST(makeRequest({}), {
      params: Promise.resolve({ id: 'meeting-1' }),
    })

    expect(generateMock).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: 'DEFAULT_PROMPT' }),
    )
    expect(putMock).toHaveBeenCalledWith(
      expect.stringMatching(/^meetings\/preview\/meeting-1-/),
      expect.any(Buffer),
      expect.objectContaining({
        access: 'public',
        token: 'blob-token',
        contentType: 'image/png',
      }),
    )
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      previewUrl: 'https://blob.example/preview.png',
      previewPathname: 'meetings/preview/meeting-1.png',
      promptUsed: 'DEFAULT_PROMPT',
    })
  })

  it('uses a custom prompt and best-effort deletes the previous preview', async () => {
    delMock.mockRejectedValue(new Error('already gone'))

    const response = await POST(
      makeRequest({
        userPrompt: '  neon skyline  ',
        replacePreviewPathname: 'meetings/preview/old.png',
      }),
      { params: Promise.resolve({ id: 'meeting-1' }) },
    )

    expect(generateMock).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: 'neon skyline' }),
    )
    expect(delMock).toHaveBeenCalledWith('meetings/preview/old.png', {
      token: 'blob-token',
    })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      promptUsed: 'neon skyline',
    })
  })
})
