import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { sendMeetingFeedbackEmailForMeetingId } from '@/lib/meetingFeedbackEmail'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  let forceResend = false
  try {
    const body = (await request.json()) as { forceResend?: boolean }
    forceResend = Boolean(body?.forceResend)
  } catch {
    /* empty body is fine */
  }

  const result = await sendMeetingFeedbackEmailForMeetingId(id, {
    forceResend,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json({ sentAt: result.sentAt }, { status: 200 })
}
