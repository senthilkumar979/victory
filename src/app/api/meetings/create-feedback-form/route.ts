import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { createMeetingFeedbackForm } from '@/lib/googleForms'
import { supabase } from '@/lib/supabaseClient'

interface CreateFeedbackFormBody {
  meetingId: string | number
  meetingTitle: string
}

export async function POST(request: NextRequest) {
  try {
    let body: CreateFeedbackFormBody
    try {
      body = (await request.json()) as CreateFeedbackFormBody
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 },
      )
    }

    const { meetingId: rawMeetingId, meetingTitle } = body
    const meetingId =
      typeof rawMeetingId === 'number'
        ? String(rawMeetingId)
        : typeof rawMeetingId === 'string'
          ? rawMeetingId.trim()
          : null
    const title =
      typeof meetingTitle === 'string' ? meetingTitle.trim() : null

    if (!meetingId || !title) {
      return NextResponse.json(
        {
          error: 'Missing or invalid required fields: meetingId, meetingTitle',
        },
        { status: 400 },
      )
    }

    if (!process.env.GOOGLE_REFRESH_TOKEN?.trim()) {
      return NextResponse.json(
        { error: 'Google Forms API not configured' },
        { status: 503 },
      )
    }

    const feedbackFormUrl = await createMeetingFeedbackForm(title)

    if (!feedbackFormUrl) {
      return NextResponse.json(
        { error: 'Failed to create feedback form' },
        { status: 502 },
      )
    }

    const { error: updateError } = await supabase
      .from('meetings')
      .update({ feedback_form: feedbackFormUrl })
      .eq('id', meetingId)

    if (updateError) {
      console.error('Failed to save feedback_form to meeting:', updateError)
      return NextResponse.json(
        {
          error: 'Form created but failed to save link. Form URL: ' +
            feedbackFormUrl,
        },
        { status: 502 },
      )
    }

    return NextResponse.json(
      { feedbackFormUrl },
      { status: 200 },
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to create feedback form'
    console.error('Create feedback form error:', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
