import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  authMock,
  generateMock,
  putMock,
  delMock,
  buildPromptMock,
  supabaseState,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  generateMock: vi.fn(),
  putMock: vi.fn(),
  delMock: vi.fn(),
  buildPromptMock: vi.fn(() => 'DEFAULT_AWARD_PROMPT'),
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
    generateAwardCoverImageWithGemini: generateMock,
  }
})

vi.mock('@/app/modules/Awards/awardCoverPrompt', () => ({
  buildDefaultAwardCoverPrompt: (...args: unknown[]) => buildPromptMock(...args),
}))

vi.mock('@/app/modules/Meetings/meetingCoverPrompt', () => ({
  getMentorBridgeLogoUrl: () => 'https://example.com/logo.png',
}))

import { GeminiImageGenerationError } from '@/lib/meetingCoverImageGeneration'

import { POST } from './route'

const awardRow = {
  id: 'award-1',
  awarded_to: 'ada@example.com',
  awarded_on: '2026-08-01',
  description: '<p>Top performer</p>',
  award_category_id: 'cat-1',
}

function mockSupabase(tables: Record<string, { data: unknown; error: unknown }>) {
  const from = vi.fn((table: string) => {
    const result = tables[table] ?? { data: null, error: null }
    const maybeSingle = vi.fn().mockResolvedValue(result)
    const eq = vi.fn().mockReturnValue({ maybeSingle })
    const select = vi.fn().mockReturnValue({ eq })
    return { select, eq, maybeSingle }
  })
  supabaseState.client = { from }
  return { from }
}

function makeRequest(body?: unknown) {
  return new Request('http://localhost/api/awards/award-1/cover-image/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

describe('POST /api/awards/[id]/cover-image/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue({ userId: 'user-1' })
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'blob-token')
    mockSupabase({
      awards: { data: awardRow, error: null },
      award_categories: { data: { name: 'Excellence' }, error: null },
      students: {
        data: { email: 'ada@example.com', name: 'Ada', batch: '2026' },
        error: null,
      },
    })
    generateMock.mockResolvedValue({
      imageBase64: Buffer.from('img').toString('base64'),
      mimeType: 'image/png',
    })
    putMock.mockResolvedValue({
      url: 'https://blob.example/award-preview.png',
      pathname: 'awards/preview/award-1.png',
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
      params: Promise.resolve({ id: 'award-1' }),
    })

    expect(response.status).toBe(401)
    expect(generateMock).not.toHaveBeenCalled()
  })

  it('returns 503 when blob storage is not configured', async () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', '')

    const response = await POST(makeRequest({}), {
      params: Promise.resolve({ id: 'award-1' }),
    })

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      error: 'Blob storage is not configured',
    })
  })

  it('rejects an empty award id before looking up the row', async () => {
    const { from } = mockSupabase({
      awards: { data: awardRow, error: null },
    })

    const response = await POST(makeRequest({}), {
      params: Promise.resolve({ id: '   ' }),
    })

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid award id',
    })
    expect(from).not.toHaveBeenCalled()
  })

  it('returns 404 when the award does not exist and 500 on fetch errors', async () => {
    mockSupabase({ awards: { data: null, error: null } })

    const missing = await POST(makeRequest({}), {
      params: Promise.resolve({ id: 'award-1' }),
    })
    expect(missing.status).toBe(404)
    expect(generateMock).not.toHaveBeenCalled()

    mockSupabase({
      awards: { data: null, error: { message: 'db down' } },
    })

    const failed = await POST(makeRequest({}), {
      params: Promise.resolve({ id: 'award-1' }),
    })
    expect(failed.status).toBe(500)
  })

  it('maps Gemini quota errors to 429', async () => {
    generateMock.mockRejectedValue(
      new GeminiImageGenerationError('Enable billing', 'quota'),
    )

    const response = await POST(makeRequest({}), {
      params: Promise.resolve({ id: 'award-1' }),
    })

    expect(response.status).toBe(429)
    await expect(response.json()).resolves.toEqual({
      error: 'Enable billing',
    })
    expect(putMock).not.toHaveBeenCalled()
  })

  it('stores a generated preview using the default prompt and student name', async () => {
    const response = await POST(makeRequest({}), {
      params: Promise.resolve({ id: 'award-1' }),
    })

    expect(buildPromptMock).toHaveBeenCalledWith(
      expect.objectContaining({
        awardedTo: 'ada@example.com',
        student: { name: 'Ada', picture: '', batch: '2026' },
      }),
      'Excellence',
    )
    expect(generateMock).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: 'DEFAULT_AWARD_PROMPT' }),
    )
    expect(putMock).toHaveBeenCalledWith(
      expect.stringMatching(/^awards\/preview\/award-1-/),
      expect.any(Buffer),
      expect.objectContaining({
        access: 'public',
        token: 'blob-token',
        contentType: 'image/png',
      }),
    )
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      previewUrl: 'https://blob.example/award-preview.png',
      previewPathname: 'awards/preview/award-1.png',
      promptUsed: 'DEFAULT_AWARD_PROMPT',
    })
  })

  it('uses a custom prompt and best-effort deletes the previous preview', async () => {
    delMock.mockRejectedValue(new Error('already gone'))

    const response = await POST(
      makeRequest({
        userPrompt: '  gold medal  ',
        replacePreviewPathname: 'awards/preview/old.png',
      }),
      { params: Promise.resolve({ id: 'award-1' }) },
    )

    expect(generateMock).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: 'gold medal' }),
    )
    expect(delMock).toHaveBeenCalledWith('awards/preview/old.png', {
      token: 'blob-token',
    })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      promptUsed: 'gold medal',
    })
  })
})
