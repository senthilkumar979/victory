import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const sendMock = vi.fn()
const templateIds = vi.hoisted(() => ({
  notification: 'template-notification',
}))

vi.mock('@/lib/resend', () => ({
  resend: {
    emails: {
      send: (...args: unknown[]) => sendMock(...args),
    },
  },
}))

vi.mock('@/lib/googleGroups/resolveGoogleGroupEmail', () => ({
  resolveGoogleGroupEmail: vi.fn(async () => 'team@googlegroups.com'),
}))

vi.mock('@/constants/ThirdPartyConstants', () => ({
  get RESEND_TEMPLATE_IDS() {
    return {
      ASSIGNMENT_NOTIFICATION: templateIds.notification,
    }
  },
}))

import { sendAssignmentNotificationEmail } from './assignmentEmail'

const baseParams = {
  googleGroupId: 'team@googlegroups.com',
  title: 'Week 1',
  description: 'Complete the lab',
  dueDate: 'Jun 15, 2026',
  assignmentUrl: 'https://mentorbridge.in/secured/assignments/1',
}

describe('assignment notification template configuration', () => {
  beforeEach(() => {
    sendMock.mockReset()
    sendMock.mockResolvedValue({ error: null })
    templateIds.notification = 'template-notification'
    delete process.env.RESEND_FROM_EMAIL
  })

  it('refuses to send when the notification template id is blank', async () => {
    templateIds.notification = '   '

    await expect(sendAssignmentNotificationEmail(baseParams)).rejects.toThrow(
      'ASSIGNMENT_NOTIFICATION template id not configured',
    )
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('trims a padded from address before sending', async () => {
    process.env.RESEND_FROM_EMAIL = '  custom@mentorbridge.in  '

    await sendAssignmentNotificationEmail(baseParams)

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'custom@mentorbridge.in',
        template: expect.objectContaining({ id: 'template-notification' }),
      }),
    )
  })
})
