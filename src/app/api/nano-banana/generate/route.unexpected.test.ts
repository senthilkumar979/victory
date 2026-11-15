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

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/nano-banana/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as never
}

describe('POST /api/nano-banana/generate unexpected failures', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue({ userId: 'user-1' })
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects a missing or non-string prompt before calling Gemini', async () => {
    const missing = await POST(makeRequest({}))
    const numeric = await POST(makeRequest({ prompt: 12 }))

    expect(missing.status).toBe(400)
    expect(numeric.status).toBe(400)
    await expect(missing.json()).resolves.toEqual({
      error: 'Missing or empty `prompt`.',
    })
    await expect(numeric.json()).resolves.toEqual({
      error: 'Missing or empty `prompt`.',
    })
    expect(generateMock).not.toHaveBeenCalled()
  })

  it('returns 500 with the config code for a configuration failure', async () => {
    generateMock.mockRejectedValueOnce(
      new NanoBananaImageError('config', 'GEMINI_API_KEY is not configured on the server.'),
    )

    const response = await POST(makeRequest({ prompt: 'logo' }))

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'GEMINI_API_KEY is not configured on the server.',
      code: 'config',
    })
  })

  it('returns the error message for unexpected errors and a generic message otherwise', async () => {
    generateMock.mockRejectedValueOnce(new Error('socket hang up'))

    const errorResponse = await POST(makeRequest({ prompt: 'logo' }))

    expect(errorResponse.status).toBe(500)
    await expect(errorResponse.json()).resolves.toEqual({
      error: 'socket hang up',
    })

    generateMock.mockRejectedValueOnce('boom')

    const stringResponse = await POST(makeRequest({ prompt: 'logo' }))

    expect(stringResponse.status).toBe(500)
    await expect(stringResponse.json()).resolves.toEqual({
      error: 'Generation failed',
    })
  })
})
