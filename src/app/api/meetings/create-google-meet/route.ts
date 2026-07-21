import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { isAdminUser } from '@/lib/auth/clerkUser'
import { requireAuth } from '@/lib/auth/requireAuth'
import {
  createCalendarEventWithMeet,
  type CreateMeetEventParams,
} from '@/lib/googleCalendar'
import { resolveGoogleGroupEmail } from '@/lib/googleGroups/resolveGoogleGroupEmail'

interface CreateGoogleMeetBody {
  title: string
  date: string
  description?: string
  attendees?: string[]
  googleGroupId?: string
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if ('response' in auth) return auth.response

  if (!isAdminUser(auth.context.user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

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

    const { title, date, description, attendees, googleGroupId } = body
    if (!title || typeof title !== 'string' || !date || typeof date !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid required fields: title, date' },
        { status: 400 },
      )
    }

    if (!process.env.GOOGLE_REFRESH_TOKEN?.trim()) {
      return NextResponse.json(
        {
          error:
            'Google Calendar is not configured (GOOGLE_REFRESH_TOKEN missing). Calendar invites cannot be sent.',
        },
        { status: 503 },
      )
    }

    const rawAttendees = Array.isArray(attendees)
      ? attendees.filter((e): e is string => typeof e === 'string')
      : []
    const resolvedFromBody =
      rawAttendees.length > 0
        ? (
            await Promise.all(
              rawAttendees.map((value) => resolveGoogleGroupEmail(value)),
            )
          ).filter((email): email is string => Boolean(email))
        : []

    const resolvedGroupEmail = await resolveGoogleGroupEmail(googleGroupId)
    const inviteEmails = [
      ...new Set(
        [
          ...resolvedFromBody,
          ...(resolvedGroupEmail ? [resolvedGroupEmail] : []),
        ].filter(Boolean),
      ),
    ]

    if (inviteEmails.length === 0) {
      return NextResponse.json(
        {
          error:
            'No valid Google Group email for calendar invite. Select a group from the directory (group email required).',
        },
        { status: 400 },
      )
    }

    const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim() || 'primary'
    const params: CreateMeetEventParams = {
      title: title.trim(),
      date,
      description: typeof description === 'string' ? description.trim() : undefined,
      attendees: inviteEmails,
    }

    const meetingLink = await createCalendarEventWithMeet(calendarId, params)

    if (!meetingLink) {
      return NextResponse.json(
        { error: 'Google Meet was created but no meeting link was returned' },
        { status: 502 },
      )
    }

    return NextResponse.json(
      { meetingLink, inviteSentTo: inviteEmails },
      { status: 200 },
    )
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
