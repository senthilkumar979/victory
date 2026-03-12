import { google } from 'googleapis'

const TIMEZONE = 'Asia/Kolkata'
const DEFAULT_DURATION_MINUTES = 120

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Missing Google OAuth credentials: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN',
    )
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret)
  oauth2Client.setCredentials({ refresh_token: refreshToken.trim() })
  return oauth2Client
}

export function generateRequestId(): string {
  return crypto.randomUUID()
}

let _calendar: ReturnType<typeof google.calendar> | null = null
function getCalendar() {
  if (!_calendar) {
    const auth = getOAuth2Client()
    _calendar = google.calendar({ version: 'v3', auth })
  }
  return _calendar
}

export const calendar = new Proxy({} as ReturnType<typeof google.calendar>, {
  get(_, prop) {
    return (getCalendar() as unknown as Record<string, unknown>)[prop as string]
  },
})

export const calendarConfig = {
  timeZone: TIMEZONE,
} as const

export interface CreateMeetEventParams {
  title: string
  date: string
  description?: string
  durationMinutes?: number
  timeZone?: string,
  attendees?: string[]
}

export async function createCalendarEventWithMeet(
  calendarId: string,
  params: CreateMeetEventParams,
): Promise<string | null> {
  const duration = params.durationMinutes ?? DEFAULT_DURATION_MINUTES
  const timeZone = params.timeZone ?? TIMEZONE
  const startDate = new Date(params.date)
  if (Number.isNaN(startDate.getTime())) throw new Error(`Invalid date: ${params.date}`)
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000)

  const requestId = generateRequestId()

  const resource = {
    summary: params.title,
    description: params.description ?? undefined,
    start: { dateTime: startDate.toISOString(), timeZone },
    end: { dateTime: endDate.toISOString(), timeZone },
    conferenceData: {
      createRequest: {
        requestId,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
        conferenceConfiguration: {
          allowGuestJoin: true
        }
      },
    },
    attendees: params.attendees?.map((email) => ({ email })) ?? undefined,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 120 },
        { method: 'email', minutes: 60 },
        { method: 'email', minutes: 10 },
        { method: 'popup', minutes: 10 },
      ],
    },
    organizer: {
      displayName: 'MentorBridge - Admin',
      email: 'mentorbridgeindia@gmail.com',
    },
    visibility: 'public',
    status: 'confirmed',
    transparency: 'opaque',
    sequence: 0,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    creator: {
      displayName: 'MentorBridge - Admin',
      email: 'mentorbridgeindia@gmail.com',
    },
    anyoneCanAddSelf: true,
    guestsCanInviteOthers: true,
    guestsCanSeeOtherGuests: true,
    guestsCanSeeEventContent: true,
  }

  const res = await calendar.events.insert({
    calendarId,
    requestBody: resource,
    conferenceDataVersion: 1,
    sendUpdates: "all"
  })

  const data = res.data
  return (
    (data.hangoutLink as string | undefined) ??
    data.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === 'video')
      ?.uri ??
    null
  )
}

function normalizeMeetLink(url: string): string {
  return url.trim().replace(/\/$/, '').toLowerCase()
}

export async function deleteCalendarEventByMeetLink(
  calendarId: string,
  meetingLink: string,
  meetingDate: string,
): Promise<boolean> {
  const link = meetingLink?.trim()
  if (!link || !link.startsWith('https://meet.google.com/')) return false

  const startDate = new Date(meetingDate)
  if (Number.isNaN(startDate.getTime())) return false

  const timeMin = new Date(startDate)
  timeMin.setHours(0, 0, 0, 0)
  const timeMax = new Date(startDate)
  timeMax.setDate(timeMax.getDate() + 1)
  timeMax.setHours(0, 0, 0, 0)

  const normalized = normalizeMeetLink(link)
  const { data } = await calendar.events.list({
    calendarId,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
  })

  const event = (data.items ?? []).find((e) => {
    const hangout = (e.hangoutLink ?? '') as string
    const videoUri = e.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === 'video',
    )?.uri ?? ''
    return (
      normalizeMeetLink(hangout) === normalized ||
      normalizeMeetLink(videoUri) === normalized
    )
  })

  if (!event?.id) return false

  await calendar.events.delete({ calendarId, eventId: event.id, sendUpdates: "all" })
  return true
}