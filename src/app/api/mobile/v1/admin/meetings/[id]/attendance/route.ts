import { NextResponse } from 'next/server'

import { authenticateMobileAdmin } from '@/lib/auth/authenticateMobileRequest'
import { updateMeetingAttendance } from '@/lib/mobile/meetingService'
import { mobileErrorResponse } from '@/lib/mobile/mobileApiUtils'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await authenticateMobileAdmin()
  if ('error' in auth) return auth.error

  try {
    const { id } = await context.params
    const body = (await request.json()) as { attendance?: number[] }
    if (!Array.isArray(body.attendance)) {
      return NextResponse.json(
        { error: 'attendance must be an array', code: 'VALIDATION_ERROR' },
        { status: 400 },
      )
    }
    const meeting = await updateMeetingAttendance(id, body.attendance)
    return NextResponse.json({ data: meeting })
  } catch (err) {
    return mobileErrorResponse(err)
  }
}
