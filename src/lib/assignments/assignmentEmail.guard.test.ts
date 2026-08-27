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

vi.mock('@/lib/googleGroups/resolveGoogleGroupEmail', () => ({
  resolveGoogleGroupEmail: vi.fn(async (value: string) =>
    value.includes('@') ? value : 'resolved@googlegroups.com',
  ),
}))

import { sendAssignmentNotificationEmail } from './assignmentEmail'

const baseParams = {
  googleGroupId: 'team@googlegroups.com',
  title: 'Week 1',
  description: 'Complete the lab',
  dueDate: 'Jun 15, 2026',
  assignmentUrl: 'https://mentorbridge.in/secured/assignments/1',
}

describe('sendAssignmentNotificationEmail guards', () => {
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

  it('throws when Resend is not configured and does not resolve a group', async () => {
    resendState.client = null
    const { resolveGoogleGroupEmail } = await import(
      '@/lib/googleGroups/resolveGoogleGroupEmail'
    )

    await expect(sendAssignmentNotificationEmail(baseParams)).rejects.toThrow(
      /Email service not configured/,
    )
    expect(resolveGoogleGroupEmail).not.toHaveBeenCalled()
  })

  it('falls back to the default from address when RESEND_FROM_EMAIL is whitespace', async () => {
    process.env.RESEND_FROM_EMAIL = '   '

    await sendAssignmentNotificationEmail(baseParams)

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'mail@mentorbridge.in' }),
    )
  })

  it('trims attachments_url and sends an empty string when none is provided', async () => {
    await sendAssignmentNotificationEmail({
      ...baseParams,
      attachmentsUrl: '  https://drive.example/file  ',
    })
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        template: expect.objectContaining({
          variables: expect.objectContaining({
            attachments_url: 'https://drive.example/file',
          }),
        }),
      }),
    )

    sendMock.mockClear()
    await sendAssignmentNotificationEmail({ ...baseParams, attachmentsUrl: null })
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        template: expect.objectContaining({
          variables: expect.objectContaining({ attachments_url: '' }),
        }),
      }),
    )
  })

  it('uses the Resend error message when present and a fallback when it is missing', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    sendMock.mockResolvedValueOnce({ error: { message: 'template missing' } })
    await expect(sendAssignmentNotificationEmail(baseParams)).rejects.toThrow(
      'template missing',
    )

    sendMock.mockResolvedValueOnce({ error: {} })
    await expect(sendAssignmentNotificationEmail(baseParams)).rejects.toThrow(
      'Failed to send assignment notification email',
    )

    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })
})
