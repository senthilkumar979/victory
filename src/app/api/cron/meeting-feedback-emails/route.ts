import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { resend } from '@/lib/resend'
import { supabase } from '@/lib/supabaseClient'
import { RESEND_TEMPLATE_IDS } from '@/constants/ThirdPartyConstants'

const HOURS_AFTER_MEETING = 2

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (!secret?.trim()) return false
  return authHeader === `Bearer ${secret}` || authHeader === secret
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!resend) {
    return NextResponse.json(
      { error: 'Email service not configured' },
      { status: 500 },
    )
  }

  const templateId = RESEND_TEMPLATE_IDS.MEETING_FEEDBACK
  if (!templateId) {
    return NextResponse.json(
      { error: 'MEETING_FEEDBACK template not configured' },
      { status: 500 },
    )
  }

  const now = new Date()
  const twoHoursAgo = new Date(
    now.getTime() - HOURS_AFTER_MEETING * 60 * 60 * 1000,
  ).toISOString()

  const { data: meetings, error: fetchError } = await supabase
    .from('meetings')
    .select('id, title, date, duration_minutes, google_group_id, feedback_form, feedback_email_sent_at')
    .is('feedback_email_sent_at', null)
    .not('feedback_form', 'is', null)
    .not('google_group_id', 'is', null)
    .not('google_group_id', 'eq', '')
    .lt('date', twoHoursAgo)

  if (fetchError) {
    console.error('Cron meeting-feedback: fetch error', fetchError)
    return NextResponse.json(
      { error: fetchError.message },
      { status: 500 },
    )
  }

  const DEFAULT_DURATION_MINUTES = 120
  const sent: string[] = []
  const failed: string[] = []

  for (const m of meetings ?? []) {
    const startDate = new Date(m.date)
    if (Number.isNaN(startDate.getTime())) continue
    const durationMin = m.duration_minutes ?? DEFAULT_DURATION_MINUTES
    const endDate = new Date(
      startDate.getTime() + durationMin * 60 * 1000,
    )
    const deadline = new Date(
      endDate.getTime() + HOURS_AFTER_MEETING * 60 * 60 * 1000,
    )
    if (deadline > now) continue

    const to = (m.google_group_id as string)?.trim()
    const feedbackFormLink = (m.feedback_form as string)?.trim()
    if (!to || !feedbackFormLink) continue

    try {
      const result = await resend.emails.send({
        from: 'mail@mentorbridge.in',
        to,
        template: {
          id: templateId,
          variables: {
            meeting_title: m.title,
            feedback_form_link: feedbackFormLink,
          },
        },
      })

      if (result.error) {
        failed.push(m.id)
        continue
      }

      const { error: updateError } = await supabase
        .from('meetings')
        .update({ feedback_email_sent_at: now.toISOString() })
        .eq('id', m.id)

      if (updateError) {
        console.error('Cron: failed to mark feedback_email_sent_at', m.id, updateError)
        failed.push(m.id)
      } else {
        sent.push(m.id)
      }
    } catch (err) {
      console.error('Cron: send email error', m.id, err)
      failed.push(m.id)
    }
  }

  return NextResponse.json(
    { sent: sent.length, failed: failed.length, sentIds: sent, failedIds: failed },
    { status: 200 },
  )
}
