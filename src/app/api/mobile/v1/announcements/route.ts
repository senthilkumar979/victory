import { NextResponse } from 'next/server'

import { authenticateMobileRequest } from '@/lib/auth/authenticateMobileRequest'
import { listAnnouncements } from '@/lib/mobile/announcementService'
import {
  mobileErrorResponse,
  parsePagination,
} from '@/lib/mobile/mobileApiUtils'

/** Authenticated students + admins can read announcements. */
export async function GET(request: Request) {
  const auth = await authenticateMobileRequest()
  if ('error' in auth) return auth.error

  try {
    const { page, limit } = parsePagination(new URL(request.url))
    const result = await listAnnouncements(page, limit)
    return NextResponse.json(result)
  } catch (err) {
    return mobileErrorResponse(err)
  }
}
