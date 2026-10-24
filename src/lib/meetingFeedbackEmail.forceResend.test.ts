import { beforeEach, describe, expect, it, vi } from 'vitest'

const { resendState, supabaseState } = vi.hoisted(() => ({
  resendState: {
    client: {
      emails: { send: vi.fn() },
    } as { emails: { send: ReturnType<typeof vi.fn> } } | null,
  },
  supabaseState: { client: null as unknown },
}))

vi.mock('@/lib/resend', () => ({
  get resend() {
    return resendState.client
  },
}))

vi.mock('@/lib/supabaseClient', () => ({
  get supabase() {
    return supabaseState.client
  },
}))

import { sendMeetingFeedbackEmailForMeetingId } from './meetingFeedbackEmail'

function mockMeetingQuery(row: Record<string, unknown> | null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: row, error: null })
  const eq = vi.fn().mockReturnValue({ maybeSingle })
  const select = vi.fn().mockReturnValue({ eq })
  const updateEq = vi.fn().mockResolvedValue({ error: null })
  const update = vi.fn().mockReturnValue({ eq: updateEq })
  supabaseState.client = { from: vi.fn().mockReturnValue({ select, update }) }
  return { update, updateEq }
}

const alreadySent = {
  id: 'mtg-1',
  title: 'Weekly sync',
  feedback_form: ' https://forms.example/feedback ',
  google_group_id: '  cohort@googlegroups.com  ',
  feedback_email_sent_at: '2026-01-01T00:00:00.000Z',
}

describe('sendMeetingFeedbackEmailForMeetingId force resend', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resendState.client = { emails: { send: vi.fn() } }
    resendState.client.emails.send.mockResolvedValue({ error: null })
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('sends again when forceResend bypasses an existing sent timestamp', async () => {
    const { updateEq } = mockMeetingQuery(alreadySent)

    const result = await sendMeetingFeedbackEmailForMeetingId('  mtg-1  ', {
      forceResend: true,
    })

    expect(result.ok).toBe(true)
    expect(resendState.client?.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'cohort@googlegroups.com',
        template: expect.objectContaining({
          variables: {
            meeting_title: 'Weekly sync',
            feedback_form_link: 'https://forms.example/feedback',
          },
        }),
      }),
    )
    expect(updateEq).toHaveBeenCalledWith('id', 'mtg-1')
  })

  it('still rejects a resend when the group or form is blank', async () => {
    mockMeetingQuery({ ...alreadySent, google_group_id: '   ' })

    await expect(
      sendMeetingFeedbackEmailForMeetingId('mtg-1', { forceResend: true }),
    ).resolves.toEqual({
      ok: false,
      error: 'Meeting has no Google Group',
      status: 400,
    })

    mockMeetingQuery({ ...alreadySent, feedback_form: '' })
    await expect(
      sendMeetingFeedbackEmailForMeetingId('mtg-1', { forceResend: true }),
    ).resolves.toEqual({
      ok: false,
      error: 'Meeting has no feedback form',
      status: 400,
    })
    expect(resendState.client?.emails.send).not.toHaveBeenCalled()
  })

  it('maps a missing provider message and a non-Error throw to generic failures', async () => {
    mockMeetingQuery(alreadySent)
    resendState.client!.emails.send.mockResolvedValueOnce({ error: {} })

    await expect(
      sendMeetingFeedbackEmailForMeetingId('mtg-1', { forceResend: true }),
    ).resolves.toEqual({
      ok: false,
      error: 'Failed to send email',
      status: 502,
    })

    mockMeetingQuery(alreadySent)
    resendState.client!.emails.send.mockRejectedValueOnce('smtp down')
    await expect(
      sendMeetingFeedbackEmailForMeetingId('mtg-1', { forceResend: true }),
    ).resolves.toEqual({
      ok: false,
      error: 'Failed to send email',
      status: 500,
    })

    mockMeetingQuery(alreadySent)
    resendState.client!.emails.send.mockRejectedValueOnce(new Error('network'))
    await expect(
      sendMeetingFeedbackEmailForMeetingId('mtg-1', { forceResend: true }),
    ).resolves.toEqual({
      ok: false,
      error: 'network',
      status: 500,
    })
  })
})
