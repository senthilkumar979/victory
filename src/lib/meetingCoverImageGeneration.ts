import 'server-only'

/**
 * Meeting covers use **Gemini 2.5 Flash Image** (codename *Nano Banana*): native
 * text + image in / image + text out via `generateContent` with image modalities.
 *
 * @see Model card — https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-image
 * @see Image generation — https://ai.google.dev/gemini-api/docs/image-generation
 *
 * Stable model id: `gemini-2.5-flash-image`. The older id `gemini-2.5-flash-image-preview`
 * is deprecated; prefer the stable id above.
 *
 * **Imagen** (e.g. Imagen 3 / 4) is a separate Google image-generation product and API
 * surface; this app uses Gemini multimodal image output only. Override `GEMINI_IMAGE_MODEL`
 * if Google documents a newer stable id for the same capability.
 *
 * **Billing:** native image generation often requires a billing-enabled project; free
 * tier may report `limit: 0`.
 */
const DEFAULT_IMAGE_MODEL = 'gemini-2.5-flash-image'
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

const USER_QUOTA_MESSAGE =
  'Gemini image generation is not available on the free tier for this API key (quota limit is 0). ' +
  'Enable billing for your Google AI project: open https://aistudio.google.com/ → gear icon → Billing & usage, ' +
  'or link a Cloud Billing account in Google Cloud Console, then create a new API key if needed. ' +
  'Docs: https://ai.google.dev/gemini-api/docs/billing'

export class GeminiImageGenerationError extends Error {
  constructor(
    message: string,
    readonly kind: 'quota' | 'other',
  ) {
    super(message)
    this.name = 'GeminiImageGenerationError'
  }
}

function resolveImageModel(): string {
  return process.env.GEMINI_IMAGE_MODEL?.trim() || DEFAULT_IMAGE_MODEL
}

export interface GenerateMeetingCoverOptions {
  /** Full prompt text (user-editable + context) */
  prompt: string
  /** Optional PNG/JPEG logo as base64 (no data URL prefix) */
  logoBase64?: string
  logoMimeType?: string
}

export interface GenerateMeetingCoverResult {
  imageBase64: string
  mimeType: string
}

function parseImageFromResponse(data: unknown): GenerateMeetingCoverResult | null {
  const root = data as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string
          inlineData?: { mimeType?: string; data?: string }
          inline_data?: { mime_type?: string; data?: string }
        }>
      }
    }>
  }
  const parts = root.candidates?.[0]?.content?.parts ?? []
  for (const part of parts) {
    const mime =
      part.inlineData?.mimeType ?? part.inline_data?.mime_type ?? 'image/png'
    const raw = part.inlineData?.data ?? part.inline_data?.data
    if (raw) {
      return { imageBase64: raw, mimeType: mime }
    }
  }
  return null
}

export async function generateMeetingCoverImageWithGemini(
  options: GenerateMeetingCoverOptions,
): Promise<GenerateMeetingCoverResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) {
    throw new GeminiImageGenerationError(
      'GEMINI_API_KEY is not configured',
      'other',
    )
  }

  const parts: Array<
    | { text: string }
    | { inline_data: { mime_type: string; data: string } }
  > = [{ text: options.prompt }]

  if (options.logoBase64 && options.logoMimeType) {
    parts.push({
      inline_data: {
        mime_type: options.logoMimeType,
        data: options.logoBase64,
      },
    })
  }

  const model = resolveImageModel()
  const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts,
        },
      ],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: '16:9',
          imageSize: '2K',
        },
      },
    }),
  })

  const data = (await res.json()) as unknown
  if (!res.ok) {
    const err = data as {
      error?: { message?: string; code?: number; status?: string }
    }
    const msg = err?.error?.message ?? `Gemini image request failed (${res.status})`
    const isQuota =
      res.status === 429 ||
      /quota|rate limit|exceeded|RESOURCE_EXHAUSTED|limit:\s*0|free_tier/i.test(
        msg,
      )
    if (isQuota) {
      console.warn('[Gemini image] quota / billing', { model, status: res.status })
      throw new GeminiImageGenerationError(USER_QUOTA_MESSAGE, 'quota')
    }
    throw new GeminiImageGenerationError(msg, 'other')
  }

  const parsed = parseImageFromResponse(data)
  if (!parsed) {
    throw new GeminiImageGenerationError(
      'No image returned from Gemini. Try adjusting the prompt.',
      'other',
    )
  }
  return parsed
}
