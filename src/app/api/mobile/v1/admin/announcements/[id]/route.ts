import { NextResponse } from 'next/server'

import { authenticateMobileAdmin } from '@/lib/auth/authenticateMobileRequest'
import {
  deleteAnnouncement,
  updateAnnouncement,
} from '@/lib/mobile/announcementService'
import { mobileErrorResponse } from '@/lib/mobile/mobileApiUtils'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await authenticateMobileAdmin()
  if ('error' in auth) return auth.error

  try {
    const { id } = await context.params
    const body = (await request.json()) as {
      title?: string
      description?: string
    }
    if (!body.title?.trim() || !body.description?.trim()) {
      return NextResponse.json(
        {
          error: 'title and description are required',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 },
      )
    }
    const announcement = await updateAnnouncement(id, {
      title: body.title,
      description: body.description,
    })
    return NextResponse.json({ data: announcement })
  } catch (err) {
    return mobileErrorResponse(err)
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await authenticateMobileAdmin()
  if ('error' in auth) return auth.error

  try {
    const { id } = await context.params
    await deleteAnnouncement(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return mobileErrorResponse(err)
  }
}
