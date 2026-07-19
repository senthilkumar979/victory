import { NextResponse } from 'next/server'

import { authenticateMobileAdmin } from '@/lib/auth/authenticateMobileRequest'
import type { MeetingFormState } from '@/app/modules/Meetings/Meeting.types'
import {
  deleteMeeting,
  getMeetingById,
  updateMeeting,
} from '@/lib/mobile/meetingService'
import { mobileErrorResponse } from '@/lib/mobile/mobileApiUtils'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await authenticateMobileAdmin()
  if ('error' in auth) return auth.error

  try {
    const { id } = await context.params
    const meeting = await getMeetingById(id)
    return NextResponse.json({ data: meeting })
  } catch (err) {
    return mobileErrorResponse(err)
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await authenticateMobileAdmin()
  if ('error' in auth) return auth.error

  try {
    const { id } = await context.params
    const body = (await request.json()) as Omit<MeetingFormState, 'id'>
    if (!body.title?.trim() || !body.date) {
      return NextResponse.json(
        { error: 'title and date are required', code: 'VALIDATION_ERROR' },
        { status: 400 },
      )
    }
    const meeting = await updateMeeting(id, {
      title: body.title,
      date: body.date,
      googleGroupId: body.googleGroupId ?? '',
      description: body.description ?? '',
      meetingLink: body.meetingLink ?? '',
      coverImageUrl: body.coverImageUrl ?? '',
      feedbackForm: body.feedbackForm,
    })
    return NextResponse.json({ data: meeting })
  } catch (err) {
    return mobileErrorResponse(err)
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await authenticateMobileAdmin()
  if ('error' in auth) return auth.error

  try {
    const { id } = await context.params
    await deleteMeeting(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return mobileErrorResponse(err)
  }
}
