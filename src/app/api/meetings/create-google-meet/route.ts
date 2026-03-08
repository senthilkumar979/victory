import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import {
  createCalendarEventWithMeet,
  type CreateMeetEventParams,
} from '@/lib/googleCalendar'

interface CreateGoogleMeetBody {
  title: string
  date: string
  description?: string
  attendees?: string[]
}

export async function POST(request: NextRequest) {
  try {
    let body: CreateGoogleMeetBody
    try {
      body = (await request.json()) as CreateGoogleMeetBody
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 },
      )
    }

    const { title, date, description, attendees } = body
    if (!title || typeof title !== 'string' || !date || typeof date !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid required fields: title, date' },
        { status: 400 },
      )
    }

    // Skip when Google Calendar is not configured (OAuth2 refresh token required).
    if (!process.env.GOOGLE_REFRESH_TOKEN?.trim()) {
      return NextResponse.json({ meetingLink: null }, { status: 200 })
    }

    const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim() || 'primary'
    const params: CreateMeetEventParams = {
      title: title.trim(),
      date,
      description: typeof description === 'string' ? description.trim() : undefined,
      attendees: attendees?.map((email) => email.trim()),
    }

    const meetingLink = await createCalendarEventWithMeet(calendarId, params)

    if (!meetingLink) {
      return NextResponse.json(
        { error: 'Google Meet was created but no meeting link was returned' },
        { status: 502 },
      )
    }

    return NextResponse.json({ meetingLink }, { status: 200 })
  } catch (err) {
    const rawMessage = err instanceof Error ? err.message : 'Failed to create Google Meet'
    const isUnauthorized =
      rawMessage.includes('unauthorized_client') ||
      (err && typeof err === 'object' && (err as { code?: number }).code === 401)
    const message = isUnauthorized
      ? 'OAuth credentials mismatch. Obtain a new refresh token from OAuth Playground using YOUR client ID/secret (gear icon → Use your own OAuth credentials).'
      : rawMessage

    console.error('Create Google Meet error:', err)
    return NextResponse.json({ error: message }, { status: isUnauthorized ? 401 : 500 })
  }
}
