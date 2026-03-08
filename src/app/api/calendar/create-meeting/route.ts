import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import {
  calendar,
  calendarConfig,
  generateRequestId,
} from '@/lib/googleCalendar'

interface CreateMeetingBody {
  title: string
  description?: string
  startTime: string
  endTime: string
  attendees?: string[]
}

interface CreateMeetingResponse {
  eventId: string
  meetLink: string
  htmlLink: string
  start: string
  end: string
}

function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const date = new Date(value)
  return !Number.isNaN(date.getTime())
}

export async function POST(request: NextRequest) {
  try {
    let body: CreateMeetingBody
    try {
      body = (await request.json()) as CreateMeetingBody
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 },
      )
    }

    const { title, description, startTime, endTime, attendees } = body
    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid required field: title' },
        { status: 400 },
      )
    }
    if (!isValidIsoDate(startTime)) {
      return NextResponse.json(
        { error: 'Invalid startTime: must be valid ISO datetime' },
        { status: 400 },
      )
    }
    if (!isValidIsoDate(endTime)) {
      return NextResponse.json(
        { error: 'Invalid endTime: must be valid ISO datetime' },
        { status: 400 },
      )
    }

    const start = new Date(startTime)
    const end = new Date(endTime)
    if (end.getTime() <= start.getTime()) {
      return NextResponse.json(
        { error: 'endTime must be after startTime' },
        { status: 400 },
      )
    }

    const emails = Array.isArray(attendees)
      ? attendees.filter((e): e is string => typeof e === 'string')
      : []

    const { data: existing } = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startTime,
      timeMax: endTime,
      singleEvents: true,
    })

    if (existing.items && existing.items.length > 0) {
      return NextResponse.json(
        { error: 'Time slot already booked' },
        { status: 409 },
      )
    }

    const requestId = generateRequestId()
    const resource = {
      summary: title.trim(),
      description: typeof description === 'string' ? description.trim() : undefined,
      start: {
        dateTime: startTime,
        timeZone: calendarConfig.timeZone,
      },
      end: {
        dateTime: endTime,
        timeZone: calendarConfig.timeZone,
      },
      attendees: emails.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    }

    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: resource,
      conferenceDataVersion: 1,
    })

    const data = res.data
    if (!data.id) {
      return NextResponse.json(
        { error: 'Event created but no ID returned' },
        { status: 502 },
      )
    }

    const meetLink =
      (data.hangoutLink as string | undefined) ??
      data.conferenceData?.entryPoints?.find(
        (ep) => ep.entryPointType === 'video',
      )?.uri ??
      ''

    const response: CreateMeetingResponse = {
      eventId: data.id,
      meetLink,
      htmlLink: data.htmlLink ?? '',
      start: data.start?.dateTime ?? startTime,
      end: data.end?.dateTime ?? endTime,
    }

    return NextResponse.json(response, { status: 201 })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to create meeting'
    // eslint-disable-next-line no-console
    console.error('Create meeting error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
