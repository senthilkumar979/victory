import { RESEND_TEMPLATE_IDS } from '@/constants/ThirdPartyConstants'
import { resend } from '@/lib/resend'
import { supabase } from '@/lib/supabaseClient'

export async function sendMeetingFeedbackEmailForMeetingId(
  meetingId: string,
): Promise<
  | { ok: true; sentAt: string }
  | { ok: false; error: string; status: number }
> {
  if (!resend) {
    return { ok: false, error: 'Email service not configured', status: 500 }
  }

  const templateId = RESEND_TEMPLATE_IDS.MEETING_FEEDBACK
  if (!templateId?.trim()) {
    return {
      ok: false,
      error: 'MEETING_FEEDBACK template not configured',
      status: 500,
    }
  }

  const id = meetingId.trim()
  if (!id) {
    return { ok: false, error: 'Invalid meeting id', status: 400 }
  }

  const { data: row, error: fetchError } = await supabase
    .from('meetings')
    .select(
      'id, title, feedback_form, google_group_id, feedback_email_sent_at',
    )
    .eq('id', id)
    .maybeSingle()

  if (fetchError) {
    console.error('sendMeetingFeedbackEmail: fetch', fetchError)
    return { ok: false, error: fetchError.message, status: 500 }
  }

  if (!row) {
    return { ok: false, error: 'Meeting not found', status: 404 }
  }

  if (row.feedback_email_sent_at) {
    return {
      ok: false,
      error: 'Feedback email was already sent for this meeting',
      status: 409,
    }
  }

  const to = (row.google_group_id as string | null)?.trim()
  const feedbackFormLink = (row.feedback_form as string | null)?.trim()
  if (!to) {
    return { ok: false, error: 'Meeting has no Google Group', status: 400 }
  }
  if (!feedbackFormLink) {
    return { ok: false, error: 'Meeting has no feedback form', status: 400 }
  }

  const now = new Date()

  try {
    const result = await resend.emails.send({
      from: 'mail@mentorbridge.in',
      to,
      template: {
        id: templateId,
        variables: {
          meeting_title: row.title as string,
          feedback_form_link: feedbackFormLink,
        },
      },
    })

    if (result.error) {
      return {
        ok: false,
        error: result.error.message ?? 'Failed to send email',
        status: 502,
      }
    }

    const { error: updateError } = await supabase
      .from('meetings')
      .update({ feedback_email_sent_at: now.toISOString() })
      .eq('id', id)

    if (updateError) {
      console.error('sendMeetingFeedbackEmail: update', updateError)
      return {
        ok: false,
        error: 'Email sent but failed to record status',
        status: 500,
      }
    }

    return { ok: true, sentAt: now.toISOString() }
  } catch (err) {
    console.error('sendMeetingFeedbackEmail: send', err)
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to send email',
      status: 500,
    }
  }
}
