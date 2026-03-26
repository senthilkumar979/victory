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

function readInlineImagePart(part: unknown): GenerateMeetingCoverResult | null {
  if (!part || typeof part !== 'object') return null
  const p = part as Record<string, unknown>
  const inline = (p.inlineData ?? p.inline_data) as Record<string, unknown> | undefined
  if (!inline) return null
  const raw = inline.data
  if (typeof raw !== 'string' || !raw.trim()) return null
  const mimeRaw = inline.mimeType ?? inline.mime_type
  const mime =
    typeof mimeRaw === 'string' && mimeRaw.startsWith('image/')
      ? mimeRaw
      : 'image/png'
  return { imageBase64: raw, mimeType: mime }
}

/** Collects model text (e.g. refusals) when no image part exists. */
function collectResponseTextParts(data: unknown): string[] {
  const out: string[] = []
  const root = data as {
    candidates?: Array<{ content?: { parts?: unknown[] } }>
  }
  for (const c of root.candidates ?? []) {
    for (const part of c.content?.parts ?? []) {
      if (!part || typeof part !== 'object') continue
      const t = (part as { text?: string }).text
      if (typeof t === 'string' && t.trim()) out.push(t.trim())
    }
  }
  return out
}

function parseImageFromResponse(data: unknown): GenerateMeetingCoverResult | null {
  const root = data as {
    candidates?: Array<{ content?: { parts?: unknown[] } }>
  }
  for (const c of root.candidates ?? []) {
    for (const part of c.content?.parts ?? []) {
      const img = readInlineImagePart(part)
      if (img) return img
    }
  }
  return null
}

function describeMissingImageResponse(data: unknown): string {
  const root = data as {
    promptFeedback?: { blockReason?: string }
    candidates?: Array<{ finishReason?: string; finishMessage?: string }>
  }
  const block = root.promptFeedback?.blockReason
  const fr = root.candidates?.[0]?.finishReason
  const fm = root.candidates?.[0]?.finishMessage
  const hints = [block, fr, fm].filter(
    (x): x is string => typeof x === 'string' && x.length > 0,
  )
  const texts = collectResponseTextParts(data)
  const extra =
    texts.length > 0
      ? texts.join(' ').slice(0, 500)
      : ''
  const base =
    hints.length > 0 ? hints.join(' · ') : 'No image part in API response'
  return extra ? `${base}. Model text: ${extra}` : base
}

type GeminiImagePart =
  | { text: string }
  | { inline_data: { mime_type: string; data: string } }

async function generateCoverImageWithGeminiParts(
  parts: GeminiImagePart[],
): Promise<GenerateMeetingCoverResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) {
    throw new GeminiImageGenerationError(
      'GEMINI_API_KEY is not configured',
      'other',
    )
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
    const detail = describeMissingImageResponse(data)
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Gemini image] no inline image in response', detail)
    }
    throw new GeminiImageGenerationError(
      `No image returned from Gemini. ${detail}`,
      'other',
    )
  }
  return parsed
}

export async function generateMeetingCoverImageWithGemini(
  options: GenerateMeetingCoverOptions,
): Promise<GenerateMeetingCoverResult> {
  const parts: GeminiImagePart[] = [{ text: options.prompt }]
  if (options.logoBase64 && options.logoMimeType) {
    parts.push({
      inline_data: {
        mime_type: options.logoMimeType,
        data: options.logoBase64,
      },
    })
  }
  return generateCoverImageWithGeminiParts(parts)
}

/** Award covers use text + MentorBridge logo only (no student photos — trophy/award visuals from prompt). */
export type GenerateAwardCoverOptions = GenerateMeetingCoverOptions

export async function generateAwardCoverImageWithGemini(
  options: GenerateAwardCoverOptions,
): Promise<GenerateMeetingCoverResult> {
  return generateMeetingCoverImageWithGemini(options)
}
