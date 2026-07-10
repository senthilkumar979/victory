import { NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth/requireAuth'
import { incrementSessionVideoViewCount } from '@/lib/sessionVideos/sessionVideoService'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireAuth()
  if ('response' in auth) return auth.response

  const { id } = await context.params

  try {
    const video = await incrementSessionVideoViewCount(id)
    if (!video) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ video })
  } catch (err) {
    console.error('[api/session-videos/[id]/view POST]', err)
    return NextResponse.json(
      { error: 'Could not record view.' },
      { status: 500 },
    )
  }
}
