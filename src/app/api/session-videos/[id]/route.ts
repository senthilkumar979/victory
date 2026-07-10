import { NextResponse } from 'next/server'

import { isAdminUser } from '@/lib/auth/clerkUser'
import { requireAuth } from '@/lib/auth/requireAuth'
import { sessionVideoFormSchema } from '@/lib/sessionVideos/sessionVideoSchemas'
import {
  deleteSessionVideo,
  getSessionVideoById,
  updateSessionVideo,
} from '@/lib/sessionVideos/sessionVideoService'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAuth()
  if ('response' in auth) return auth.response

  const { id } = await context.params

  try {
    const video = await getSessionVideoById(id)
    if (!video) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({
      video,
      isAdmin: isAdminUser(auth.context.user),
    })
  } catch (err) {
    console.error('[api/session-videos/[id] GET]', err)
    return NextResponse.json(
      { error: 'Could not load video.' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAuth()
  if ('response' in auth) return auth.response

  if (!isAdminUser(auth.context.user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await context.params

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
    const video = await updateSessionVideo(id, {
      title: values.title,
      youtubeUrl: values.youtubeUrl,
      category: values.category,
      isFeatured: values.isFeatured,
    })

    return NextResponse.json({ video })
  } catch (err) {
    console.error('[api/session-videos/[id] PATCH]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not update video.' },
      { status: 500 },
    )
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAuth()
  if ('response' in auth) return auth.response

  if (!isAdminUser(auth.context.user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await context.params

  try {
    await deleteSessionVideo(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[api/session-videos/[id] DELETE]', err)
    return NextResponse.json(
      { error: 'Could not delete video.' },
      { status: 500 },
    )
  }
}
