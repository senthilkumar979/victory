import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const sendMock = vi.fn()
const resendState: { client: { emails: { send: typeof sendMock } } | null } = {
  client: {
    emails: {
      send: (...args: unknown[]) => sendMock(...args),
    },
  },
}

vi.mock('@/lib/resend', () => ({
  get resend() {
    return resendState.client
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

describe('sendSubmissionFeedbackEmail guards', () => {
  beforeEach(() => {
    sendMock.mockReset()
    sendMock.mockResolvedValue({ error: null })
    resendState.client = {
      emails: {
        send: (...args: unknown[]) => sendMock(...args),
      },
    }
    delete process.env.RESEND_FROM_EMAIL
  })

  it('skips sending when Resend is unconfigured instead of throwing', async () => {
    resendState.client = null
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await expect(sendSubmissionFeedbackEmail(baseParams)).resolves.toBeUndefined()

    expect(sendMock).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Resend not configured'),
    )
    warn.mockRestore()
  })

  it('falls back to the default from address when RESEND_FROM_EMAIL is whitespace', async () => {
    process.env.RESEND_FROM_EMAIL = '   '

    await sendSubmissionFeedbackEmail(baseParams)

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'mail@mentorbridge.in' }),
    )
  })

  it('sends an empty feedback_comment when the comment is whitespace-only', async () => {
    await sendSubmissionFeedbackEmail({
      ...baseParams,
      feedbackComment: '   ',
    })

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        template: expect.objectContaining({
          variables: expect.objectContaining({
            feedback_comment: '',
            rating: '4',
          }),
        }),
      }),
    )
  })
})
