import { auth } from '@clerk/nextjs/server'
import { del } from '@vercel/blob'
import { put } from '@vercel/blob'
import { randomUUID } from 'crypto'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { buildDefaultAwardCoverPrompt } from '@/app/modules/Awards/awardCoverPrompt'
import type { AwardFormState } from '@/app/modules/Awards/Award.types'
import {
  GeminiImageGenerationError,
  generateAwardCoverImageWithGemini,
} from '@/lib/meetingCoverImageGeneration'
import { supabase } from '@/lib/supabaseClient'
import { getMentorBridgeLogoUrl } from '@/app/modules/Meetings/meetingCoverPrompt'

export const maxDuration = 120

async function fetchLogoAsBase64(): Promise<{
  base64: string
  mimeType: string
} | null> {
  try {
    const res = await fetch(getMentorBridgeLogoUrl(), { cache: 'no-store' })
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    const mimeType =
      res.headers.get('content-type')?.split(';')[0]?.trim() || 'image/png'
    return { base64: buf.toString('base64'), mimeType }
  } catch {
    return null
  }
}

function mapAwardRow(row: Record<string, unknown>): AwardFormState {
  return {
    id: row.id as string,
    awardedTo: (row.awarded_to as string) ?? '',
    awardedOn: (row.awarded_on as string) ?? '',
    description: (row.description as string) ?? '',
    awardCategoryId: (row.award_category_id as string) ?? '',
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim()
  if (!token) {
    return NextResponse.json(
      { error: 'Blob storage is not configured' },
      { status: 503 },
    )
  }

  const { id: awardId } = await params
  if (!awardId?.trim()) {
    return NextResponse.json({ error: 'Invalid award id' }, { status: 400 })
  }

  let body: { userPrompt?: string; replacePreviewPathname?: string }
  try {
    body = (await request.json()) as typeof body
  } catch {
    body = {}
  }

  const { data: row, error: fetchError } = await supabase
    .from('awards')
    .select('id, awarded_to, awarded_on, description, award_category_id')
    .eq('id', awardId)
    .maybeSingle()

  if (fetchError || !row) {
    return NextResponse.json(
      { error: 'Award not found' },
      { status: fetchError ? 500 : 404 },
    )
  }

  const baseAward = mapAwardRow(row as Record<string, unknown>)
  let categoryName = ''
  if (baseAward.awardCategoryId) {
    const { data: cat } = await supabase
      .from('award_categories')
      .select('name')
      .eq('id', baseAward.awardCategoryId)
      .maybeSingle()
    categoryName = (cat?.name as string) ?? ''
  }

  const { data: studentRow } = await supabase
    .from('students')
    .select('email, name, batch')
    .eq('email', baseAward.awardedTo)
    .maybeSingle()

  const award: AwardFormState = {
    ...baseAward,
    student: studentRow
      ? {
          name: studentRow.name ?? '',
          picture: '',
          batch: studentRow.batch ?? '',
        }
      : undefined,
  }

  const prompt =
    typeof body.userPrompt === 'string' && body.userPrompt.trim()
      ? body.userPrompt.trim()
      : buildDefaultAwardCoverPrompt(award, categoryName)

  const logo = await fetchLogoAsBase64()

  let imageBase64: string
  let mimeType: string
  try {
    const result = await generateAwardCoverImageWithGemini({
      prompt,
      logoBase64: logo?.base64,
      logoMimeType: logo?.mimeType,
    })
    imageBase64 = result.imageBase64
    mimeType = result.mimeType
  } catch (e) {
    if (e instanceof GeminiImageGenerationError && e.kind === 'quota') {
      return NextResponse.json({ error: e.message }, { status: 429 })
    }
    const msg =
      e instanceof Error ? e.message : 'Failed to generate cover image'
    console.error('award cover-image generate:', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  const ext =
    mimeType.includes('jpeg') || mimeType.includes('jpg')
      ? 'jpg'
      : mimeType.includes('webp')
        ? 'webp'
        : 'png'

  if (body.replacePreviewPathname?.trim()) {
    try {
      await del(body.replacePreviewPathname.trim(), { token })
    } catch {
      /* best-effort */
    }
  }

  const previewPathname = `awards/preview/${awardId}-${randomUUID()}.${ext}`
  const buffer = Buffer.from(imageBase64, 'base64')

  const blob = await put(previewPathname, buffer, {
    access: 'public',
    token,
    contentType: mimeType,
  })

  return NextResponse.json({
    previewUrl: blob.url,
    previewPathname: blob.pathname,
    promptUsed: prompt,
  })
}
