import { NextResponse } from 'next/server'

import { authenticateMobileAdmin } from '@/lib/auth/authenticateMobileRequest'
import type { MeetingFormState } from '@/app/modules/Meetings/Meeting.types'
import {
  createMeeting,
  listMeetings,
} from '@/lib/mobile/meetingService'
import {
  mobileErrorResponse,
  parsePagination,
} from '@/lib/mobile/mobileApiUtils'

export async function GET(request: Request) {
  const auth = await authenticateMobileAdmin()
  if ('error' in auth) return auth.error

  try {
    const url = new URL(request.url)
    const { page, limit } = parsePagination(url)
    const from = url.searchParams.get('from') ?? undefined
    const to = url.searchParams.get('to') ?? undefined
    const result = await listMeetings(page, limit, { from, to })
    return NextResponse.json(result)
  } catch (err) {
    return mobileErrorResponse(err)
  }
}

export async function POST(request: Request) {
  const auth = await authenticateMobileAdmin()
  if ('error' in auth) return auth.error

  try {
    const body = (await request.json()) as Omit<MeetingFormState, 'id'>
    if (!body.title?.trim() || !body.date) {
      return NextResponse.json(
        { error: 'title and date are required', code: 'VALIDATION_ERROR' },
        { status: 400 },
      )
    }
    const meeting = await createMeeting({
      title: body.title,
      date: body.date,
      googleGroupId: body.googleGroupId ?? '',
      description: body.description ?? '',
      meetingLink: body.meetingLink ?? '',
      coverImageUrl: body.coverImageUrl ?? '',
      feedbackForm: body.feedbackForm,
    })
    return NextResponse.json({ data: meeting }, { status: 201 })
  } catch (err) {
    return mobileErrorResponse(err)
  }
}
