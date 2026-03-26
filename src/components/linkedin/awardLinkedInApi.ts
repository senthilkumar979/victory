import type { AwardFormState } from '@/app/modules/Awards/Award.types'
import { buildAwardLinkedInPostBody } from '@/lib/linkedin/buildAwardLinkedInPostRequest'

/** Dedupes parallel cover + post bootstrap (React Strict Mode runs effects twice in dev). */
const inflightBootstrap = new Map<
  string,
  Promise<{
    cover: Awaited<ReturnType<typeof requestAwardCoverGenerate>>
    post: Awaited<ReturnType<typeof requestAwardPostGenerate>>
  }>
>()

export async function requestAwardCoverGenerate(
  awardId: string,
  body: { userPrompt?: string; replacePreviewPathname?: string },
): Promise<{
  ok: boolean
  status: number
  data: {
    error?: string
    previewUrl?: string
    previewPathname?: string
    promptUsed?: string
  }
}> {
  const res = await fetch(
    `/api/awards/${encodeURIComponent(awardId)}/cover-image/generate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )
  const data = (await res.json()) as {
    error?: string
    previewUrl?: string
    previewPathname?: string
    promptUsed?: string
  }
  return { ok: res.ok, status: res.status, data }
}

export async function requestAwardPostGenerate(
  award: AwardFormState,
  categoryName: string,
) {
  const res = await fetch('/api/linkedin/generate-post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildAwardLinkedInPostBody(award, categoryName)),
  })
  const data = (await res.json()) as { error?: string; commentary?: string }
  return { ok: res.ok, data }
}

/** Single network round-trip pair for initial drawer load; coalesces duplicate effect runs. */
export function requestAwardLinkedInBootstrapDeduped(
  awardId: string,
  award: AwardFormState,
  categoryName: string,
) {
  const key = `${awardId}:${categoryName}`
  const existing = inflightBootstrap.get(key)
  if (existing) return existing

  const p = (async () => {
    const [cover, post] = await Promise.all([
      requestAwardCoverGenerate(awardId, {}),
      requestAwardPostGenerate(award, categoryName),
    ])
    return { cover, post }
  })().finally(() => {
    inflightBootstrap.delete(key)
  })

  inflightBootstrap.set(key, p)
  return p
}

export async function requestLinkedInPublish(
  commentary: string,
  imageUrl: string,
  imageAltText: string,
) {
  const res = await fetch('/api/linkedin/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      commentary,
      imageUrl,
      imageAltText: imageAltText.slice(0, 400),
    }),
  })
  const data = (await res.json()) as { error?: string }
  return { ok: res.ok, data }
}
