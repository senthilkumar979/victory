import 'server-only'

import { GoogleGenerativeAI } from '@google/generative-ai'

import type {
  GenerateLinkedInPostInput,
  LinkedInGeneratedPost,
} from '@/lib/linkedin/types'

const MODEL_ID = 'gemini-2.5-flash'

const SYSTEM_DEFAULT = `You write short, professional LinkedIn posts for a company Page (not personal profiles).
Return ONLY valid JSON with keys: title (string, one line hook under 120 chars), description (string, 2-4 short paragraphs, no hashtags inside), hashtags (array of 4-8 strings WITHOUT the # symbol, relevant to tech/education/community).
Do not include markdown. Keep total content suitable for a ~2500 character post body when combined with a URL and hashtags later.`

const SYSTEM_AWARD = `You write short, professional LinkedIn posts for a company Page celebrating student achievements and mentorship (not personal profiles).
Return ONLY valid JSON with keys: title (string, one line hook under 120 chars), description (string, 2-4 short paragraphs, no hashtags inside), hashtags (array of 4-8 strings WITHOUT the # symbol, relevant to education, mentorship, student success, learning, and community).
Mention the award context naturally in the description. Do not include markdown. Keep total content suitable for a ~2500 character post body when combined with a URL and hashtags later.`

function extractJsonObject(text: string): string {
  const t = text.trim()
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(t)
  if (fence?.[1]) return fence[1].trim()
  return t
}

function parseGeneratedJson(text: string): LinkedInGeneratedPost {
  const trimmed = extractJsonObject(text)
  const parsed = JSON.parse(trimmed) as unknown
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid JSON from model')
  }
  const o = parsed as Record<string, unknown>
  const title = typeof o.title === 'string' ? o.title.trim() : ''
  const description =
    typeof o.description === 'string' ? o.description.trim() : ''
  const rawTags = o.hashtags
  const hashtags = Array.isArray(rawTags)
    ? rawTags
        .filter((t): t is string => typeof t === 'string')
        .map((t) => t.replace(/^#/, '').trim())
        .filter(Boolean)
    : []
  if (!title || !description) {
    throw new Error('Missing title or description in model output')
  }
  return { title, description, hashtags }
}

export function buildCommentaryFromGenerated(
  generated: LinkedInGeneratedPost,
  primaryLink: string,
): string {
  const tagLine = generated.hashtags
    .map((h) => (h.startsWith('#') ? h : `#${h}`))
    .join(' ')
  const link = primaryLink.trim()
  return [generated.title, '', generated.description, '', tagLine, '', link]
    .join('\n')
    .trim()
}

export async function generateLinkedInPostWithGemini(
  input: GenerateLinkedInPostInput,
): Promise<LinkedInGeneratedPost> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const ctx = [
    `Event / content title: ${input.title}`,
    `Description: ${input.description}`,
    input.context ? `Additional context:\n${input.context}` : null,
    `Link to include in the post (do not repeat verbatim as raw URL in description; we append it programmatically): ${input.primaryLink}`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const system =
    input.variant === 'award' ? SYSTEM_AWARD : SYSTEM_DEFAULT

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: MODEL_ID,
    generationConfig: {
      responseMimeType: 'application/json',
    },
  })

  const result = await model.generateContent(`${system}\n\n---\n${ctx}`)
  const text = result.response.text()?.trim()
  if (!text) throw new Error('No content generated')

  return parseGeneratedJson(text)
}
