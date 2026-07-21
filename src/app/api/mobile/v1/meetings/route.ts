import { NextResponse } from 'next/server'

import { authenticateMobileRequest } from '@/lib/auth/authenticateMobileRequest'
import { listMeetings } from '@/lib/mobile/meetingService'
import {
  mobileErrorResponse,
  parsePagination,
} from '@/lib/mobile/mobileApiUtils'

/** Authenticated members (students + admins) can read the events calendar. */
export async function GET(request: Request) {
  const auth = await authenticateMobileRequest()
  if ('error' in auth) return auth.error

  try {
    const url = new URL(request.url)
    const { page, limit } = parsePagination(url)
    const from = url.searchParams.get('from') ?? undefined
    const to = url.searchParams.get('to') ?? undefined
    const result = await listMeetings(page, limit, { from, to })
    return NextResponse.json(result)
  } catch (err) {
    return mobileErrorResponse(err)
  }
}
