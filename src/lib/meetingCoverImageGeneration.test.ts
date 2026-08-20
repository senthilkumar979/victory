import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import {
  GeminiImageGenerationError,
  generateAwardCoverImageWithGemini,
  generateMeetingCoverImageWithGemini,
} from './meetingCoverImageGeneration'

function geminiUrl(model = 'gemini-2.5-flash-image') {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=test-key`
}

function imageResponse(overrides?: {
  inlineKey?: 'inlineData' | 'inline_data'
  mimeKey?: 'mimeType' | 'mime_type'
  mime?: string
}) {
  const inlineKey = overrides?.inlineKey ?? 'inlineData'
  const mimeKey = overrides?.mimeKey ?? 'mimeType'
  return {
    candidates: [
      {
        content: {
          parts: [
            {
              [inlineKey]: {
                data: 'aW1hZ2U=',
                [mimeKey]: overrides?.mime ?? 'image/png',
              },
            },
          ],
        },
      },
    ],
  }
}

describe('generateMeetingCoverImageWithGemini', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('GEMINI_API_KEY', 'test-key')
    delete process.env.GEMINI_IMAGE_MODEL
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('throws a non-quota error when GEMINI_API_KEY is missing', async () => {
    vi.stubEnv('GEMINI_API_KEY', '')

    await expect(
      generateMeetingCoverImageWithGemini({ prompt: 'cover' }),
    ).rejects.toMatchObject({
      name: 'GeminiImageGenerationError',
      kind: 'other',
      message: 'GEMINI_API_KEY is not configured',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('maps HTTP 429 and quota-like messages to the user-facing quota error', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ error: { message: 'RESOURCE_EXHAUSTED' } }),
    })

    try {
      await generateMeetingCoverImageWithGemini({ prompt: 'cover' })
      throw new Error('expected quota failure')
    } catch (error) {
      expect(error).toBeInstanceOf(GeminiImageGenerationError)
      expect((error as GeminiImageGenerationError).kind).toBe('quota')
      expect((error as GeminiImageGenerationError).message).toContain(
        'Enable billing',
      )
    }

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: 'free_tier limit: 0' } }),
    })

    await expect(
      generateMeetingCoverImageWithGemini({ prompt: 'cover' }),
    ).rejects.toMatchObject({ kind: 'quota' })
  })

  it('preserves non-quota Gemini error messages', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: 'prompt too long' } }),
    })

    await expect(
      generateMeetingCoverImageWithGemini({ prompt: 'cover' }),
    ).rejects.toMatchObject({
      kind: 'other',
      message: 'prompt too long',
    })
  })

  it('throws when the model returns no image, including block hints', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        promptFeedback: { blockReason: 'SAFETY' },
        candidates: [
          {
            finishReason: 'STOP',
            content: { parts: [{ text: 'I cannot draw that' }] },
          },
        ],
      }),
    })

    await expect(
      generateMeetingCoverImageWithGemini({ prompt: 'cover' }),
    ).rejects.toMatchObject({
      kind: 'other',
      message: expect.stringContaining('SAFETY'),
    })
  })

  it('parses snake_case inline image parts and includes a logo attachment', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () =>
        imageResponse({
          inlineKey: 'inline_data',
          mimeKey: 'mime_type',
          mime: 'image/jpeg',
        }),
    })

    const result = await generateMeetingCoverImageWithGemini({
      prompt: 'session cover',
      logoBase64: 'bG9nbw==',
      logoMimeType: 'image/png',
    })

    expect(result).toEqual({ imageBase64: 'aW1hZ2U=', mimeType: 'image/jpeg' })
    expect(fetchMock).toHaveBeenCalledWith(
      geminiUrl(),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"mime_type":"image/png"'),
      }),
    )
  })

  it('uses GEMINI_IMAGE_MODEL when set and shares the helper for awards', async () => {
    vi.stubEnv('GEMINI_IMAGE_MODEL', 'gemini-custom')
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => imageResponse(),
    })

    await generateAwardCoverImageWithGemini({ prompt: 'award' })

    expect(fetchMock).toHaveBeenCalledWith(
      geminiUrl('gemini-custom'),
      expect.any(Object),
    )
  })
})
