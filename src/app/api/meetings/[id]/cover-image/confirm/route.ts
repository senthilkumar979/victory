import { auth } from '@clerk/nextjs/server'
import { copy, del } from '@vercel/blob'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

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

  let body: { previewPathname?: string }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const previewPathname =
    typeof body.previewPathname === 'string' ? body.previewPathname.trim() : ''
  if (!previewPathname) {
    return NextResponse.json(
      { error: 'Missing previewPathname' },
      { status: 400 },
    )
  }

  const segments = previewPathname.split('/')
  const last = segments[segments.length - 1] ?? ''
  const dot = last.lastIndexOf('.')
  const ext = dot > 0 ? last.slice(dot + 1) : 'png'
  const finalPathname = `${meetingId}.${ext}`

  const copied = await copy(previewPathname, finalPathname, {
    access: 'public',
    token,
    allowOverwrite: true,
  })

  try {
    await del(previewPathname, { token })
  } catch {
    /* preview removal is best-effort */
  }

  const { error: updateError } = await supabase
    .from('meetings')
    .update({ cover_image_url: copied.url })
    .eq('id', meetingId)

  if (updateError) {
    console.error('confirm cover: supabase update', updateError)
    return NextResponse.json(
      { error: 'Image saved but failed to update meeting' },
      { status: 502 },
    )
  }

  return NextResponse.json({ coverImageUrl: copied.url }, { status: 200 })
}
