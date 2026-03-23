import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { sendMeetingFeedbackEmailForMeetingId } from '@/lib/meetingFeedbackEmail'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const result = await sendMeetingFeedbackEmailForMeetingId(id)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json({ sentAt: result.sentAt }, { status: 200 })
}
