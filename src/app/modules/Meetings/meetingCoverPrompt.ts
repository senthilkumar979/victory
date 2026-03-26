import { formatDate, stripHtml } from '@/utils/meetingUtils'

import type { MeetingFormState } from './Meeting.types'

const LOGO_URL =
  'https://91qunajyvl11yxyb.public.blob.vercel-storage.com/long-logo'

export function getMentorBridgeLogoUrl(): string {
  return LOGO_URL
}

export function buildDefaultMeetingCoverPrompt(meeting: MeetingFormState): string {
  const desc = stripHtml(meeting.description ?? '')
  const descShort =
    desc.length > 600 ? `${desc.slice(0, 600).trim()}…` : desc

  return `Create a single professional 16:9 widescreen cover image for an online MentorBridge session.

Meeting title: ${meeting.title || 'Untitled'}
Date & time (IST): ${formatDate(meeting.date)}
${descShort ? `Session focus / description:\n${descShort}` : ''}

The second image attachment is the official MentorBridge logo (long horizontal wordmark). Integrate it clearly and professionally: prefer a corner lockup or a subtle header band so the brand identity is unmistakable. Do not distort or crop the logo awkwardly; preserve legibility.

Visual direction: modern, clean, corporate-tech education aesthetic; generous whitespace; balanced composition; suitable for a calendar card or event thumbnail. Avoid clutter, tiny unreadable text, and stock-photo clichés. If you include title text, make it large and legible. Brand Color is #d53f8c. Don't add description in the cover image. Its just for you to grab the context of the meeting. Don't make any spelling mistakes`
}
