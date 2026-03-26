import 'server-only'

import {
  BlockReason,
  FinishReason,
  GoogleGenerativeAI,
  type GenerationConfig,
  type GenerateContentResponse,
} from '@google/generative-ai'

/** Nano Banana 2 — Gemini 3.1 Flash Image; override via `GEMINI_NANO_BANANA_IMAGE_MODEL`. */
const DEFAULT_MODEL = 'gemini-3.1-flash-image'

/**
 * SDK `GenerationConfig` typings omit image fields; API accepts them when serialized.
 * @see https://ai.google.dev/gemini-api/docs/image-generation
 */
function buildImageGenerationConfig(): GenerationConfig {
  return {
    responseModalities: ['IMAGE'],
    imageConfig: {
      imageSize: '1K',
      aspectRatio: '1:1',
    },
  } as GenerationConfig
}

function extractBase64FromResponse(
  data: GenerateContentResponse,
): { imageBase64: string; mimeType: string } {
  const pf = data.promptFeedback
  if (
    pf?.blockReason &&
    pf.blockReason !== BlockReason.BLOCKED_REASON_UNSPECIFIED
  ) {
    const msg =
      pf.blockReasonMessage ??
      `Prompt or response blocked (${pf.blockReason}).`
    throw new NanoBananaImageError('safety', msg)
  }

  const candidates = data.candidates ?? []
  const first = candidates[0]
  if (!first) {
    throw new NanoBananaImageError(
      'empty',
      'No image was returned. Try a different prompt.',
    )
  }

  if (
    first.finishReason === FinishReason.SAFETY ||
    first.finishReason === FinishReason.BLOCKLIST ||
    first.finishReason === FinishReason.PROHIBITED_CONTENT
  ) {
    throw new NanoBananaImageError(
      'safety',
      'Generation stopped for safety reasons. Try rephrasing your prompt.',
    )
  }

  const parts = first.content?.parts ?? []
  for (const part of parts) {
    if ('inlineData' in part && part.inlineData?.data) {
      return {
        imageBase64: part.inlineData.data,
        mimeType: part.inlineData.mimeType ?? 'image/png',
      }
    }
  }

  throw new NanoBananaImageError(
    'empty',
    'No image data in the model response. Try again or adjust the prompt.',
  )
}

export type NanoBananaErrorKind =
  | 'quota'
  | 'safety'
  | 'empty'
  | 'config'
  | 'unknown'

export class NanoBananaImageError extends Error {
  constructor(
    readonly kind: NanoBananaErrorKind,
    message: string,
  ) {
    super(message)
    this.name = 'NanoBananaImageError'
  }
}

export async function generateNanoBananaImage(prompt: string): Promise<{
  imageBase64: string
  mimeType: string
}> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) {
    throw new NanoBananaImageError(
      'config',
      'GEMINI_API_KEY is not configured on the server.',
    )
  }

  const modelId =
    process.env.GEMINI_NANO_BANANA_IMAGE_MODEL?.trim() || DEFAULT_MODEL
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: modelId,
    generationConfig: buildImageGenerationConfig(),
  })

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt.trim() }],
        },
      ],
    })
    return extractBase64FromResponse(result.response)
  } catch (e) {
    if (e instanceof NanoBananaImageError) throw e
    const msg = e instanceof Error ? e.message : String(e)
    const lower = msg.toLowerCase()
    if (
      /quota|rate limit|exceeded|resource_exhausted|429|limit:\s*0|free_tier/i.test(
        lower,
      )
    ) {
      throw new NanoBananaImageError(
        'quota',
        'Rate limit or quota exceeded. Wait a moment and try again, or check billing in Google AI Studio.',
      )
    }
    if (/safety|blocked|block/i.test(lower)) {
      throw new NanoBananaImageError(
        'safety',
        'Request blocked by safety filters. Try a different prompt.',
      )
    }
    throw new NanoBananaImageError(
      'unknown',
      msg || 'Image generation failed.',
    )
  }
}
