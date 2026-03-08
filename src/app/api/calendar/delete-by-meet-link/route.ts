import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { deleteCalendarEventByMeetLink } from '@/lib/googleCalendar'

interface DeleteByMeetLinkBody {
  meetingLink: string
  date: string
}

export async function POST(request: NextRequest) {
  try {
    let body: DeleteByMeetLinkBody
    try {
      body = (await request.json()) as DeleteByMeetLinkBody
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 },
      )
    }

    const { meetingLink, date } = body
    if (!meetingLink || typeof meetingLink !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid required field: meetingLink' },
        { status: 400 },
      )
    }
    if (!date || typeof date !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid required field: date' },
        { status: 400 },
      )
    }

    if (!meetingLink.trim().startsWith('https://meet.google.com/')) {
      return NextResponse.json(
        { success: true, deleted: false },
        { status: 200 },
      )
    }

    if (!process.env.GOOGLE_REFRESH_TOKEN?.trim()) {
      return NextResponse.json(
        { success: true, deleted: false },
        { status: 200 },
      )
    }

    const calendarId =
      process.env.GOOGLE_CALENDAR_ID?.trim() || 'primary'
    const deleted = await deleteCalendarEventByMeetLink(
      calendarId,
      meetingLink.trim(),
      date.trim(),
    )

    return NextResponse.json({ success: true, deleted }, { status: 200 })
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : 'Unknown error'
    const statusCode =
      err && typeof err === 'object' && 'code' in err
        ? (err as { code?: number }).code
        : undefined
    // eslint-disable-next-line no-console
    console.error('Delete by meet link error:', err)

    const status = statusCode === 404 || errMessage.includes('404') ? 404 : 500

    return NextResponse.json(
      {
        error:
          status === 404 ? 'Event not found' : 'Failed to delete from Google Calendar',
      },
      { status },
    )
  }
}
