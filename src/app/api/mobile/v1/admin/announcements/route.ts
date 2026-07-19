import { NextResponse } from 'next/server'

import { authenticateMobileAdmin } from '@/lib/auth/authenticateMobileRequest'
import {
  createAnnouncement,
  listAnnouncements,
} from '@/lib/mobile/announcementService'
import {
  mobileErrorResponse,
  parsePagination,
} from '@/lib/mobile/mobileApiUtils'

export async function GET(request: Request) {
  const auth = await authenticateMobileAdmin()
  if ('error' in auth) return auth.error

  try {
    const { page, limit } = parsePagination(new URL(request.url))
    const result = await listAnnouncements(page, limit)
    return NextResponse.json(result)
  } catch (err) {
    return mobileErrorResponse(err)
  }
}

export async function POST(request: Request) {
  const auth = await authenticateMobileAdmin()
  if ('error' in auth) return auth.error

  try {
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
    const announcement = await createAnnouncement({
      title: body.title,
      description: body.description,
    })
    return NextResponse.json({ data: announcement }, { status: 201 })
  } catch (err) {
    return mobileErrorResponse(err)
  }
}
