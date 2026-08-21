import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { authMock, generateMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  generateMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: authMock,
}))

vi.mock('@/lib/nanoBananaImage', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/nanoBananaImage')>()
  return {
    ...original,
    generateNanoBananaImage: generateMock,
  }
})

import { NanoBananaImageError } from '@/lib/nanoBananaImage'

import { POST } from './route'

function makeRequest(body?: unknown) {
  return new Request('http://localhost/api/nano-banana/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? '{' : JSON.stringify(body),
  }) as never
}

describe('POST /api/nano-banana/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue({ userId: 'user-1' })
    generateMock.mockResolvedValue({
      imageBase64: 'aW1hZ2U=',
      mimeType: 'image/png',
    })
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 401 when the caller is unauthenticated', async () => {
    authMock.mockResolvedValue({ userId: null })

    const response = await POST(makeRequest({ prompt: 'logo' }))

    expect(response.status).toBe(401)
    expect(generateMock).not.toHaveBeenCalled()
  })

  it('rejects invalid JSON and empty prompts before calling Gemini', async () => {
    const invalidJson = await POST(
      new Request('http://localhost/api/nano-banana/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{',
      }) as never,
    )

    expect(invalidJson.status).toBe(400)
    await expect(invalidJson.json()).resolves.toEqual({
      error: 'Invalid JSON body',
    })

    const emptyPrompt = await POST(makeRequest({ prompt: '   ' }))

    expect(emptyPrompt.status).toBe(400)
    await expect(emptyPrompt.json()).resolves.toEqual({
      error: 'Missing or empty `prompt`.',
    })
    expect(generateMock).not.toHaveBeenCalled()
  })

  it('maps quota to 429, safety to 422, and other kinds to 500', async () => {
    generateMock.mockRejectedValueOnce(
      new NanoBananaImageError('quota', 'Rate limit or quota exceeded'),
    )

    const quota = await POST(makeRequest({ prompt: 'logo' }))
    expect(quota.status).toBe(429)
    await expect(quota.json()).resolves.toEqual({
      error: 'Rate limit or quota exceeded',
      code: 'quota',
    })

    generateMock.mockRejectedValueOnce(
      new NanoBananaImageError('safety', 'Blocked'),
    )

    const safety = await POST(makeRequest({ prompt: 'logo' }))
    expect(safety.status).toBe(422)
    await expect(safety.json()).resolves.toEqual({
      error: 'Blocked',
      code: 'safety',
    })

    generateMock.mockRejectedValueOnce(
      new NanoBananaImageError('empty', 'No image data'),
    )

    const empty = await POST(makeRequest({ prompt: 'logo' }))
    expect(empty.status).toBe(500)
    await expect(empty.json()).resolves.toEqual({
      error: 'No image data',
      code: 'empty',
    })
  })

  it('returns the generated image payload', async () => {
    const response = await POST(makeRequest({ prompt: '  neon badge  ' }))

    expect(generateMock).toHaveBeenCalledWith('neon badge')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      imageBase64: 'aW1hZ2U=',
      mimeType: 'image/png',
    })
  })
})
