import { NextResponse } from 'next/server'

import { isAdminUser } from '@/lib/auth/clerkUser'
import { requireAuth } from '@/lib/auth/requireAuth'
import { sessionVideoFormSchema } from '@/lib/sessionVideos/sessionVideoSchemas'
import {
  createSessionVideo,
  listSessionVideos,
} from '@/lib/sessionVideos/sessionVideoService'

export async function GET() {
  const auth = await requireAuth()
  if ('response' in auth) return auth.response

  try {
    const videos = await listSessionVideos()
    return NextResponse.json({
      videos,
      isAdmin: isAdminUser(auth.context.user),
    })
  } catch (err) {
    console.error('[api/session-videos GET]', err)
    return NextResponse.json(
      { error: 'Could not load videos.' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if ('response' in auth) return auth.response

  if (!isAdminUser(auth.context.user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const parsed = sessionVideoFormSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      )
    }

    const values = parsed.data
    const video = await createSessionVideo({
      title: values.title,
      youtubeUrl: values.youtubeUrl,
      category: values.category,
      isFeatured: values.isFeatured,
      createdBy: auth.context.email,
    })

    return NextResponse.json({ video })
  } catch (err) {
    console.error('[api/session-videos POST]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not create video.' },
      { status: 500 },
    )
  }
}
