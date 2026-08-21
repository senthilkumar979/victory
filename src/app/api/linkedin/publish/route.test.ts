import { beforeEach, describe, expect, it, vi } from 'vitest'

const { authMock, publishMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  publishMock: vi.fn(),
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: authMock,
}))

vi.mock('@/lib/linkedin/publishToLinkedIn', () => ({
  publishImagePostToLinkedIn: publishMock,
}))

import { POST } from './route'

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/linkedin/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }) as never
}

const validBody = {
  commentary: 'We shipped a new cohort.',
  imageUrl: 'https://cdn.example.com/cover.png',
  imageAltText: 'Award cover',
}

describe('POST /api/linkedin/publish', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue({ userId: 'admin-1' })
    publishMock.mockResolvedValue({ postUrn: 'urn:li:share:1' })
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('returns 401 when the caller is unauthenticated', async () => {
    authMock.mockResolvedValue({ userId: null })

    const response = await POST(makeRequest(validBody))

    expect(response.status).toBe(401)
    expect(publishMock).not.toHaveBeenCalled()
  })

  it('rejects invalid JSON and payload shape before publishing', async () => {
    const invalidJson = await POST(makeRequest('{'))
    expect(invalidJson.status).toBe(400)
    await expect(invalidJson.json()).resolves.toEqual({
      error: 'Invalid JSON body',
    })

    const invalidUrl = await POST(
      makeRequest({ commentary: 'hi', imageUrl: 'not-a-url' }),
    )
    expect(invalidUrl.status).toBe(400)
    expect(publishMock).not.toHaveBeenCalled()
  })

  it('publishes the post and forwards LinkedIn failures as 500', async () => {
    const success = await POST(makeRequest(validBody))
    expect(publishMock).toHaveBeenCalledWith(validBody)
    expect(success.status).toBe(200)
    await expect(success.json()).resolves.toEqual({ postUrn: 'urn:li:share:1' })

    publishMock.mockRejectedValueOnce(new Error('token expired'))
    const failed = await POST(makeRequest(validBody))
    expect(failed.status).toBe(500)
    await expect(failed.json()).resolves.toEqual({ error: 'token expired' })
  })
})
