import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const sendMock = vi.fn()

vi.mock('@/lib/resend', () => ({
  resend: {
    emails: {
      send: (...args: unknown[]) => sendMock(...args),
    },
  },
}))

vi.mock('@/lib/googleGroups/resolveGoogleGroupEmail', () => ({
  resolveGoogleGroupEmail: vi.fn(async (value: string) =>
    value.includes('@') ? value : 'resolved@googlegroups.com',
  ),
}))

import {
  sendAssignmentNotificationEmail,
  sendSubmissionFeedbackEmail,
} from './assignmentEmail'
import { RESEND_TEMPLATE_IDS } from '@/constants/ThirdPartyConstants'

describe('sendAssignmentNotificationEmail', () => {
  beforeEach(() => {
    sendMock.mockReset()
    sendMock.mockResolvedValue({ error: null })
    delete process.env.RESEND_FROM_EMAIL
  })

  it('sends to resolved group email with verified from address', async () => {
    const result = await sendAssignmentNotificationEmail({
      googleGroupId: 'team@googlegroups.com',
      title: 'Week 1',
      description: 'Complete the lab',
      dueDate: 'Jun 15, 2026',
      assignmentUrl: 'https://mentorbridge.in/secured/assignments/1',
    })

    expect(result.sentTo).toBe('team@googlegroups.com')
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'mail@mentorbridge.in',
        to: 'team@googlegroups.com',
        template: expect.objectContaining({
          id: RESEND_TEMPLATE_IDS.ASSIGNMENT_NOTIFICATION,
          variables: expect.objectContaining({
            assignment_title: 'Week 1',
            due_date: 'Jun 15, 2026',
            assignment_url: 'https://mentorbridge.in/secured/assignments/1',
          }),
        }),
      }),
    )
  })

  it('uses RESEND_FROM_EMAIL when set', async () => {
    process.env.RESEND_FROM_EMAIL = 'MentorBridge <custom@mentorbridge.in>'

    await sendAssignmentNotificationEmail({
      googleGroupId: 'team@googlegroups.com',
      title: 'Week 1',
      description: 'Complete the lab',
      dueDate: 'Jun 15, 2026',
      assignmentUrl: 'https://mentorbridge.in/secured/assignments/1',
    })

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'MentorBridge <custom@mentorbridge.in>',
      }),
    )
  })

  it('throws when group email cannot be resolved', async () => {
    const { resolveGoogleGroupEmail } = await import(
      '@/lib/googleGroups/resolveGoogleGroupEmail'
    )
    vi.mocked(resolveGoogleGroupEmail).mockResolvedValueOnce(null)

    await expect(
      sendAssignmentNotificationEmail({
        googleGroupId: 'not-a-valid-group',
        title: 'Week 1',
        description: 'Complete the lab',
        dueDate: 'Jun 15, 2026',
        assignmentUrl: 'https://mentorbridge.in/secured/assignments/1',
      }),
    ).rejects.toThrow(/Could not resolve Google Group email/)
  })
})

describe('sendSubmissionFeedbackEmail', () => {
  beforeEach(() => {
    sendMock.mockReset()
    sendMock.mockResolvedValue({ error: null })
    delete process.env.RESEND_FROM_EMAIL
  })

  it('sends the feedback template with trimmed comment and string rating', async () => {
    await sendSubmissionFeedbackEmail({
      to: 'student@example.com',
      studentName: 'Ada',
      assignmentTitle: 'Week 1',
      rating: 4,
      reviewedBy: 'Mentor',
      feedbackComment: '  Strong work  ',
    })

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'mail@mentorbridge.in',
        to: 'student@example.com',
        template: {
          id: RESEND_TEMPLATE_IDS.ASSIGNMENT_SUBMISSION_FEEDBACK,
          variables: {
            subject: 'Feedback for Week 1',
            student_name: 'Ada',
            assignment_title: 'Week 1',
            rating: '4',
            reviewed_by: 'Mentor',
            feedback_comment: 'Strong work',
          },
        },
      }),
    )
  })

  it('uses an empty feedback_comment when none is provided', async () => {
    await sendSubmissionFeedbackEmail({
      to: 'student@example.com',
      studentName: 'Ada',
      assignmentTitle: 'Week 1',
      rating: 5,
      reviewedBy: 'Mentor',
    })

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        template: expect.objectContaining({
          variables: expect.objectContaining({
            feedback_comment: '',
            rating: '5',
          }),
        }),
      }),
    )
  })

  it('surfaces Resend failures instead of swallowing them', async () => {
    sendMock.mockResolvedValueOnce({ error: { message: 'template missing' } })
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    await expect(
      sendSubmissionFeedbackEmail({
        to: 'student@example.com',
        studentName: 'Ada',
        assignmentTitle: 'Week 1',
        rating: 3,
        reviewedBy: 'Mentor',
      }),
    ).rejects.toThrow('Failed to send feedback email')

    expect(consoleError).toHaveBeenCalled()
  })
})
