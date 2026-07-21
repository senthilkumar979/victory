import 'server-only'

import { RESEND_TEMPLATE_IDS } from '@/constants/ThirdPartyConstants'
import { resolveGoogleGroupEmail } from '@/lib/googleGroups/resolveGoogleGroupEmail'
import { resend } from '@/lib/resend'

const DEFAULT_RESEND_FROM = 'mail@mentorbridge.in'

function getResendFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_RESEND_FROM
}

export interface AssignmentNotificationEmailParams {
  googleGroupId: string
  title: string
  description: string
  dueDate: string
  assignmentUrl: string
  attachmentsUrl?: string | null
}

export async function sendAssignmentNotificationEmail(
  params: AssignmentNotificationEmailParams,
): Promise<{ sentTo: string }> {
  if (!resend) {
    throw new Error(
      'Email service not configured. Set RESEND_API_KEY on the server.',
    )
  }

  const sentTo = await resolveGoogleGroupEmail(params.googleGroupId)
  if (!sentTo) {
    throw new Error(
      'Could not resolve Google Group email. Select a group from the directory.',
    )
  }

  const templateId = RESEND_TEMPLATE_IDS.ASSIGNMENT_NOTIFICATION
  if (!templateId?.trim()) {
    throw new Error('ASSIGNMENT_NOTIFICATION template id not configured')
  }

  const { error } = await resend.emails.send({
    from: getResendFromAddress(),
    to: sentTo,
    template: {
      id: templateId,
      variables: {
        subject: params.title,
        assignment_title: params.title,
        due_date: params.dueDate,
        assignment_description: params.description,
        assignment_url: params.assignmentUrl,
        attachments_url: params.attachmentsUrl?.trim() ?? '',
      },
    },
  })

  if (error) {
    console.error('[assignment-email]', error)
    throw new Error(error.message ?? 'Failed to send assignment notification email')
  }

  return { sentTo }
}

export async function sendSubmissionFeedbackEmail(params: {
  to: string
  studentName: string
  assignmentTitle: string
  rating: number
  reviewedBy: string
  feedbackComment?: string | null
}): Promise<void> {
  if (!resend) {
    console.warn('[assignment-feedback-email] Resend not configured; skipping email.')
    return
  }

  const templateId = RESEND_TEMPLATE_IDS.ASSIGNMENT_SUBMISSION_FEEDBACK
  if (!templateId?.trim()) {
    throw new Error('ASSIGNMENT_SUBMISSION_FEEDBACK template id not configured')
  }

  const { error } = await resend.emails.send({
    from: getResendFromAddress(),
    to: params.to,
    template: {
      id: templateId,
      variables: {
        subject: `Feedback for ${params.assignmentTitle}`,
        student_name: params.studentName,
        assignment_title: params.assignmentTitle,
        rating: params.rating.toString(),
        reviewed_by: params.reviewedBy,
        feedback_comment: params.feedbackComment?.trim() ?? '',
      },
    },
  })

  if (error) {
    console.error('[assignment-feedback-email]', error)
    throw new Error('Failed to send feedback email')
  }
}
