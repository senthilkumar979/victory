import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import {
  resolveMeetingCoverExtension,
  saveMeetingCoverImage,
  validateMeetingCoverFile,
} from '@/lib/meetingCoverImageStorage'
import { supabase } from '@/lib/supabaseClient'

export const maxDuration = 60

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: meetingId } = await params
  if (!meetingId?.trim()) {
    return NextResponse.json({ error: 'Invalid meeting id' }, { status: 400 })
  }

  const { data: row, error: fetchError } = await supabase
    .from('meetings')
    .select('id')
    .eq('id', meetingId)
    .maybeSingle()

  if (fetchError || !row) {
    return NextResponse.json(
      { error: 'Meeting not found' },
      { status: fetchError ? 500 : 404 },
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing image file' }, { status: 400 })
  }

  const validationError = validateMeetingCoverFile(file)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  const ext = resolveMeetingCoverExtension(file)
  if (!ext) {
    return NextResponse.json(
      { error: 'Only JPG, PNG, and WebP images are allowed.' },
      { status: 400 },
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const mimeType =
    file.type?.trim() ||
    (ext === 'jpg'
      ? 'image/jpeg'
      : ext === 'png'
        ? 'image/png'
        : 'image/webp')

  try {
    const coverImageUrl = await saveMeetingCoverImage(meetingId, buffer, mimeType)
    return NextResponse.json({ coverImageUrl }, { status: 200 })
  } catch (err) {
    console.error('[cover-image upload]', err)
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : 'Failed to upload cover image',
      },
      { status: 500 },
    )
  }
}
