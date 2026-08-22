import { beforeEach, describe, expect, it, vi } from 'vitest'

const { authMock, generateMock, buildCommentaryMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  generateMock: vi.fn(),
  buildCommentaryMock: vi.fn(),
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: authMock,
}))

vi.mock('@/lib/linkedin/generateLinkedInPost', () => ({
  generateLinkedInPostWithGemini: generateMock,
  buildCommentaryFromGenerated: buildCommentaryMock,
}))

import { POST } from './route'

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/linkedin/generate-post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }) as never
}

const validBody = {
  title: 'Cohort launch',
  description: 'Students shipped production work.',
  primaryLink: 'https://mentorbridge.in/awards',
  variant: 'award' as const,
}

describe('POST /api/linkedin/generate-post', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue({ userId: 'admin-1' })
    generateMock.mockResolvedValue({
      title: 'Win',
      description: 'Great work.',
      hashtags: ['community'],
    })
    buildCommentaryMock.mockReturnValue('Win\n\nGreat work.\n\n#community')
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('returns 401 when the caller is unauthenticated', async () => {
    authMock.mockResolvedValue({ userId: null })

    const response = await POST(makeRequest(validBody))

    expect(response.status).toBe(401)
    expect(generateMock).not.toHaveBeenCalled()
  })

  it('rejects invalid JSON and payload shape before calling Gemini', async () => {
    const invalidJson = await POST(makeRequest('{'))
    expect(invalidJson.status).toBe(400)
    await expect(invalidJson.json()).resolves.toEqual({
      error: 'Invalid JSON body',
    })

    const invalidUrl = await POST(
      makeRequest({
        title: 'Win',
        description: 'Great work.',
        primaryLink: 'not-a-url',
      }),
    )
    expect(invalidUrl.status).toBe(400)
    expect(generateMock).not.toHaveBeenCalled()
  })

  it('returns generated commentary and maps generation failures to 500', async () => {
    const success = await POST(makeRequest(validBody))

    expect(generateMock).toHaveBeenCalledWith(validBody)
    expect(buildCommentaryMock).toHaveBeenCalledWith(
      {
        title: 'Win',
        description: 'Great work.',
        hashtags: ['community'],
      },
      validBody.primaryLink,
    )
    expect(success.status).toBe(200)
    await expect(success.json()).resolves.toEqual({
      generated: {
        title: 'Win',
        description: 'Great work.',
        hashtags: ['community'],
      },
      commentary: 'Win\n\nGreat work.\n\n#community',
    })

    generateMock.mockRejectedValueOnce(new Error('GEMINI_API_KEY is not configured'))
    const failed = await POST(makeRequest(validBody))
    expect(failed.status).toBe(500)
    await expect(failed.json()).resolves.toEqual({
      error: 'GEMINI_API_KEY is not configured',
    })
  })
})
