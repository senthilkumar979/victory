import { NextResponse } from 'next/server'

import { authenticateMobileRequest } from '@/lib/auth/authenticateMobileRequest'
import { getMeetingById } from '@/lib/mobile/meetingService'
import { mobileErrorResponse } from '@/lib/mobile/mobileApiUtils'

/** Authenticated members can view a single event / meeting. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateMobileRequest()
  if ('error' in auth) return auth.error

  try {
    const { id } = await context.params
    const meeting = await getMeetingById(id)
    return NextResponse.json({ data: meeting })
  } catch (err) {
    return mobileErrorResponse(err)
  }
}
