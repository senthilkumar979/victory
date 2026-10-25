import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const sendMock = vi.fn()
const templateIds = vi.hoisted(() => ({
  feedback: 'template-feedback',
}))

vi.mock('@/lib/resend', () => ({
  resend: {
    emails: {
      send: (...args: unknown[]) => sendMock(...args),
    },
  },
}))

vi.mock('@/constants/ThirdPartyConstants', () => ({
  get RESEND_TEMPLATE_IDS() {
    return {
      ASSIGNMENT_SUBMISSION_FEEDBACK: templateIds.feedback,
    }
  },
}))

import { sendSubmissionFeedbackEmail } from './assignmentEmail'

const baseParams = {
  to: 'student@example.com',
  studentName: 'Ada',
  assignmentTitle: 'Week 1',
  rating: 4,
  reviewedBy: 'Mentor',
}

describe('sendSubmissionFeedbackEmail failures', () => {
  beforeEach(() => {
    sendMock.mockReset()
    sendMock.mockResolvedValue({ error: null })
    templateIds.feedback = 'template-feedback'
    delete process.env.RESEND_FROM_EMAIL
  })

  it('throws a fixed message when the provider returns an error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    sendMock.mockResolvedValueOnce({ error: { message: 'quota exceeded' } })
    sendMock.mockResolvedValueOnce({ error: {} })

    await expect(sendSubmissionFeedbackEmail(baseParams)).rejects.toThrow(
      'Failed to send feedback email',
    )
    await expect(sendSubmissionFeedbackEmail(baseParams)).rejects.toThrow(
      'Failed to send feedback email',
    )

    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it('refuses to send when the feedback template id is blank', async () => {
    templateIds.feedback = '   '

    await expect(sendSubmissionFeedbackEmail(baseParams)).rejects.toThrow(
      'ASSIGNMENT_SUBMISSION_FEEDBACK template id not configured',
    )
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('sends an empty comment for null and uses a custom from address', async () => {
    process.env.RESEND_FROM_EMAIL = 'MentorBridge <custom@mentorbridge.in>'

    await sendSubmissionFeedbackEmail({ ...baseParams, feedbackComment: null })

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'MentorBridge <custom@mentorbridge.in>',
        template: expect.objectContaining({
          id: 'template-feedback',
          variables: expect.objectContaining({
            feedback_comment: '',
            subject: 'Feedback for Week 1',
            rating: '4',
          }),
        }),
      }),
    )
  })
})
