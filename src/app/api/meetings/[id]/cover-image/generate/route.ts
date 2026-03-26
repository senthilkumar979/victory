import { auth } from '@clerk/nextjs/server'
import { del } from '@vercel/blob'
import { put } from '@vercel/blob'
import { randomUUID } from 'crypto'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import {
  GeminiImageGenerationError,
  generateMeetingCoverImageWithGemini,
} from '@/lib/meetingCoverImageGeneration'
import { supabase } from '@/lib/supabaseClient'
import {
  buildDefaultMeetingCoverPrompt,
  getMentorBridgeLogoUrl,
} from '@/app/modules/Meetings/meetingCoverPrompt'
import type { MeetingFormState } from '@/app/modules/Meetings/Meeting.types'

export const maxDuration = 120

function mapMeetingRow(row: Record<string, unknown>): MeetingFormState {
  return {
    id: row.id as string,
    title: (row.title as string) ?? '',
    date: (row.date as string) ?? '',
    googleGroupId: (row.google_group_id as string) ?? '',
    description: (row.description as string) ?? '',
    meetingLink: (row.meeting_link as string) ?? '',
    coverImageUrl: (row.cover_image_url as string) ?? '',
  }
}

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

  const { id: meetingId } = await params
  if (!meetingId?.trim()) {
    return NextResponse.json({ error: 'Invalid meeting id' }, { status: 400 })
  }

  let body: { userPrompt?: string; replacePreviewPathname?: string }
  try {
    body = (await request.json()) as typeof body
  } catch {
    body = {}
  }

  const { data: row, error: fetchError } = await supabase
    .from('meetings')
    .select(
      'id, title, date, google_group_id, description, meeting_link, cover_image_url',
    )
    .eq('id', meetingId)
    .maybeSingle()

  if (fetchError || !row) {
    return NextResponse.json(
      { error: 'Meeting not found' },
      { status: fetchError ? 500 : 404 },
    )
  }

  const meeting = mapMeetingRow(row as Record<string, unknown>)
  const prompt =
    typeof body.userPrompt === 'string' && body.userPrompt.trim()
      ? body.userPrompt.trim()
      : buildDefaultMeetingCoverPrompt(meeting)

  const logo = await fetchLogoAsBase64()

  let imageBase64: string
  let mimeType: string
  try {
    const result = await generateMeetingCoverImageWithGemini({
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
    console.error('cover-image generate:', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  const ext = mimeType.includes('jpeg') || mimeType.includes('jpg')
    ? 'jpg'
    : mimeType.includes('webp')
      ? 'webp'
      : 'png'

  if (body.replacePreviewPathname?.trim()) {
    try {
      await del(body.replacePreviewPathname.trim(), { token })
    } catch {
      /* best-effort cleanup */
    }
  }

  const previewPathname = `meetings/preview/${meetingId}-${randomUUID()}.${ext}`
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
