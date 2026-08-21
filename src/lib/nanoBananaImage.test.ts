import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { generateContentMock, getGenerativeModelMock } = vi.hoisted(() => ({
  generateContentMock: vi.fn(),
  getGenerativeModelMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@google/generative-ai', async (importOriginal) => {
  const original = await importOriginal<typeof import('@google/generative-ai')>()

  function GoogleGenerativeAI() {}
  GoogleGenerativeAI.prototype.getGenerativeModel = function getGenerativeModel(
    opts: unknown,
  ) {
    getGenerativeModelMock(opts)
    return { generateContent: generateContentMock }
  }

  return {
    ...original,
    GoogleGenerativeAI,
  }
})

import {
  FinishReason,
  BlockReason,
} from '@google/generative-ai'

import {
  NanoBananaImageError,
  generateNanoBananaImage,
} from './nanoBananaImage'

function imageResponse(overrides?: {
  mimeType?: string
  promptFeedback?: { blockReason?: string; blockReasonMessage?: string }
  finishReason?: string
  parts?: unknown[]
  candidates?: unknown[] | null
}) {
  return {
    promptFeedback: overrides?.promptFeedback,
    candidates:
      overrides?.candidates === null
        ? undefined
        : (overrides?.candidates ?? [
            {
              finishReason: overrides?.finishReason,
              content: {
                parts: overrides?.parts ?? [
                  {
                    inlineData: {
                      data: 'aW1hZ2U=',
                      mimeType: overrides?.mimeType ?? 'image/png',
                    },
                  },
                ],
              },
            },
          ]),
  }
}

describe('generateNanoBananaImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('GEMINI_API_KEY', 'test-key')
    delete process.env.GEMINI_NANO_BANANA_IMAGE_MODEL
    generateContentMock.mockResolvedValue({
      response: imageResponse(),
    })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('throws a config error when GEMINI_API_KEY is missing', async () => {
    vi.stubEnv('GEMINI_API_KEY', '')

    await expect(generateNanoBananaImage('a logo')).rejects.toMatchObject({
      name: 'NanoBananaImageError',
      kind: 'config',
      message: 'GEMINI_API_KEY is not configured on the server.',
    })
    expect(generateContentMock).not.toHaveBeenCalled()
  })

  it('maps prompt-feedback blocks and safety finish reasons', async () => {
    generateContentMock.mockResolvedValueOnce({
      response: imageResponse({
        promptFeedback: {
          blockReason: BlockReason.SAFETY,
          blockReasonMessage: 'Blocked by SAFETY',
        },
      }),
    })

    await expect(generateNanoBananaImage('unsafe')).rejects.toMatchObject({
      kind: 'safety',
      message: 'Blocked by SAFETY',
    })

    generateContentMock.mockResolvedValueOnce({
      response: imageResponse({ finishReason: FinishReason.SAFETY }),
    })

    await expect(generateNanoBananaImage('unsafe')).rejects.toMatchObject({
      kind: 'safety',
      message: 'Generation stopped for safety reasons. Try rephrasing your prompt.',
    })
  })

  it('ignores unspecified block reasons and extracts inline image data', async () => {
    generateContentMock.mockResolvedValue({
      response: imageResponse({
        promptFeedback: {
          blockReason: BlockReason.BLOCKED_REASON_UNSPECIFIED,
        },
        mimeType: 'image/jpeg',
      }),
    })

    await expect(generateNanoBananaImage('  badge  ')).resolves.toEqual({
      imageBase64: 'aW1hZ2U=',
      mimeType: 'image/jpeg',
    })
    expect(generateContentMock).toHaveBeenCalledWith({
      contents: [
        {
          role: 'user',
          parts: [{ text: 'badge' }],
        },
      ],
    })
  })

  it('throws empty when no candidates or image parts are returned', async () => {
    generateContentMock.mockResolvedValueOnce({
      response: { candidates: [] },
    })

    await expect(generateNanoBananaImage('empty')).rejects.toMatchObject({
      kind: 'empty',
      message: 'No image was returned. Try a different prompt.',
    })

    generateContentMock.mockResolvedValueOnce({
      response: imageResponse({
        parts: [{ text: 'I cannot draw that' }],
      }),
    })

    await expect(generateNanoBananaImage('empty')).rejects.toMatchObject({
      kind: 'empty',
      message: 'No image data in the model response. Try again or adjust the prompt.',
    })
  })

  it('maps quota, safety, and unknown SDK errors without wrapping NanoBananaImageError', async () => {
    generateContentMock.mockRejectedValueOnce(
      new Error('RESOURCE_EXHAUSTED 429 free_tier limit: 0'),
    )

    await expect(generateNanoBananaImage('cover')).rejects.toMatchObject({
      kind: 'quota',
      message: expect.stringContaining('Rate limit or quota exceeded'),
    })

    generateContentMock.mockRejectedValueOnce(new Error('Request blocked'))

    await expect(generateNanoBananaImage('cover')).rejects.toMatchObject({
      kind: 'safety',
      message: 'Request blocked by safety filters. Try a different prompt.',
    })

    generateContentMock.mockRejectedValueOnce(new Error('model overloaded'))

    await expect(generateNanoBananaImage('cover')).rejects.toMatchObject({
      kind: 'unknown',
      message: 'model overloaded',
    })

    generateContentMock.mockRejectedValueOnce(
      new NanoBananaImageError('empty', 'already classified'),
    )

    await expect(generateNanoBananaImage('cover')).rejects.toMatchObject({
      kind: 'empty',
      message: 'already classified',
    })
  })

  it('uses GEMINI_NANO_BANANA_IMAGE_MODEL when set', async () => {
    vi.stubEnv('GEMINI_NANO_BANANA_IMAGE_MODEL', 'gemini-custom-image')

    await generateNanoBananaImage('cover')

    expect(getGenerativeModelMock).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'gemini-custom-image' }),
    )
  })
})
