import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { calendar } from '@/lib/googleCalendar'

interface CancelMeetingBody {
  eventId: string
}

export async function POST(request: NextRequest) {
  try {
    let body: CancelMeetingBody
    try {
      body = (await request.json()) as CancelMeetingBody
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 },
      )
    }

    const { eventId } = body
    if (!eventId || typeof eventId !== 'string' || !eventId.trim()) {
      return NextResponse.json(
        { error: 'Missing or invalid required field: eventId' },
        { status: 400 },
      )
    }

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId.trim(),
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : 'Unknown error'
    const statusCode =
      err && typeof err === 'object' && 'code' in err
        ? (err as { code?: number }).code
        : undefined
    // eslint-disable-next-line no-console
    console.error('Cancel meeting error:', err)

    const status = statusCode === 404 || errMessage.includes('404') ? 404 : 500

    return NextResponse.json(
      { error: status === 404 ? 'Event not found' : 'Failed to cancel meeting' },
      { status },
    )
  }
}
