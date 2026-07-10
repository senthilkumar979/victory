import 'server-only'

import { resend } from '@/lib/resend'

export async function sendAssignmentNotificationEmail(params: {
  to: string
  title: string
  description: string
  dueDate: string
  assignmentUrl: string
  attachmentsUrl?: string | null
}): Promise<void> {
  if (!resend) {
    console.warn('[assignment-email] Resend not configured; skipping email.')
    return
  }

  const attachmentLine = params.attachmentsUrl
    ? `<p><strong>Attachments:</strong> <a href="${params.attachmentsUrl}">${params.attachmentsUrl}</a></p>`
    : ''

  const html = `
    <h2>New assignment: ${params.title}</h2>
    <p><strong>Due:</strong> ${params.dueDate}</p>
    <div>${params.description.replace(/\n/g, '<br/>')}</div>
    ${attachmentLine}
    <p><a href="${params.assignmentUrl}">Open assignment</a></p>
  `

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'MentorBridge <onboarding@resend.dev>',
    to: params.to,
    subject: `Assignment: ${params.title}`,
    html,
  })

  if (error) {
    console.error('[assignment-email]', error)
    throw new Error('Failed to send assignment notification email')
  }
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

  const commentBlock = params.feedbackComment?.trim()
    ? `<p><strong>Comment:</strong></p><p>${params.feedbackComment.replace(/\n/g, '<br/>')}</p>`
    : ''

  const html = `
    <h2>Assignment feedback</h2>
    <p>Hi ${params.studentName},</p>
    <p>Your submission for <strong>${params.assignmentTitle}</strong> has been reviewed.</p>
    <p><strong>Rating:</strong> ${params.rating} / 5</p>
    <p><strong>Reviewed by:</strong> ${params.reviewedBy}</p>
    ${commentBlock}
    <p>Sign in to MentorBridge to view your assignment and feedback.</p>
  `

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'MentorBridge <onboarding@resend.dev>',
    to: params.to,
    subject: `Feedback on "${params.assignmentTitle}" — ${params.rating}/5`,
    html,
  })

  if (error) {
    console.error('[assignment-feedback-email]', error)
    throw new Error('Failed to send feedback email')
  }
}
