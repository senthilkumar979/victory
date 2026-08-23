import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

import { RESEND_TEMPLATE_IDS } from '@/constants/ThirdPartyConstants'

import { sendMeetingFeedbackEmailForMeetingId } from './meetingFeedbackEmail'

function mockMeetingQuery(result: {
  data: Record<string, unknown> | null
  error: { message: string } | null
}) {
  const maybeSingle = vi.fn().mockResolvedValue(result)
  const eq = vi.fn().mockReturnValue({ maybeSingle })
  const select = vi.fn().mockReturnValue({ eq })
  const updateEq = vi.fn().mockResolvedValue({ error: null })
  const update = vi.fn().mockReturnValue({ eq: updateEq })
  const from = vi.fn().mockReturnValue({ select, update })
  supabaseState.client = { from }
  return { from, select, eq, maybeSingle, update, updateEq }
}

const meetingRow = {
  id: 'mtg-1',
  title: 'Weekly sync',
  feedback_form: ' https://forms.example/feedback ',
  google_group_id: '  cohort@googlegroups.com  ',
  feedback_email_sent_at: null,
}

describe('sendMeetingFeedbackEmailForMeetingId', () => {
  const originalTemplateId = RESEND_TEMPLATE_IDS.MEETING_FEEDBACK

  beforeEach(() => {
    vi.clearAllMocks()
    RESEND_TEMPLATE_IDS.MEETING_FEEDBACK = originalTemplateId
    resendState.client = { emails: { send: vi.fn() } }
    resendState.client.emails.send.mockResolvedValue({ error: null })
    mockMeetingQuery({ data: meetingRow, error: null })
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    RESEND_TEMPLATE_IDS.MEETING_FEEDBACK = originalTemplateId
  })

  it('fails closed when Resend, the template, or the meeting id is missing', async () => {
    resendState.client = null
    await expect(sendMeetingFeedbackEmailForMeetingId('mtg-1')).resolves.toEqual({
      ok: false,
      error: 'Email service not configured',
      status: 500,
    })

    resendState.client = { emails: { send: vi.fn() } }
    RESEND_TEMPLATE_IDS.MEETING_FEEDBACK = '  '
    await expect(sendMeetingFeedbackEmailForMeetingId('mtg-1')).resolves.toEqual({
      ok: false,
      error: 'MEETING_FEEDBACK template not configured',
      status: 500,
    })

    RESEND_TEMPLATE_IDS.MEETING_FEEDBACK = originalTemplateId
    await expect(sendMeetingFeedbackEmailForMeetingId('   ')).resolves.toEqual({
      ok: false,
      error: 'Invalid meeting id',
      status: 400,
    })
  })

  it('maps fetch misses, already-sent, and missing group/form', async () => {
    mockMeetingQuery({ data: null, error: { message: 'db down' } })
    await expect(sendMeetingFeedbackEmailForMeetingId('mtg-1')).resolves.toEqual({
      ok: false,
      error: 'db down',
      status: 500,
    })

    mockMeetingQuery({ data: null, error: null })
    await expect(sendMeetingFeedbackEmailForMeetingId('mtg-1')).resolves.toEqual({
      ok: false,
      error: 'Meeting not found',
      status: 404,
    })

    mockMeetingQuery({
      data: { ...meetingRow, feedback_email_sent_at: '2026-01-01T00:00:00.000Z' },
      error: null,
    })
    await expect(sendMeetingFeedbackEmailForMeetingId('mtg-1')).resolves.toEqual({
      ok: false,
      error: 'Feedback email was already sent for this meeting',
      status: 409,
    })

    mockMeetingQuery({
      data: { ...meetingRow, google_group_id: '  ' },
      error: null,
    })
    await expect(sendMeetingFeedbackEmailForMeetingId('mtg-1')).resolves.toEqual({
      ok: false,
      error: 'Meeting has no Google Group',
      status: 400,
    })

    mockMeetingQuery({
      data: { ...meetingRow, feedback_form: null },
      error: null,
    })
    await expect(sendMeetingFeedbackEmailForMeetingId('mtg-1')).resolves.toEqual({
      ok: false,
      error: 'Meeting has no feedback form',
      status: 400,
    })
  })

  it('sends, records status, and maps provider or update failures', async () => {
    const { update, updateEq } = mockMeetingQuery({ data: meetingRow, error: null })
    const ok = await sendMeetingFeedbackEmailForMeetingId('  mtg-1  ')
    expect(ok.ok).toBe(true)
    if (ok.ok) expect(ok.sentAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
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
    expect(update).toHaveBeenCalled()
    expect(updateEq).toHaveBeenCalledWith('id', 'mtg-1')

    resendState.client!.emails.send.mockResolvedValueOnce({
      error: { message: 'rate limited' },
    })
    await expect(sendMeetingFeedbackEmailForMeetingId('mtg-1')).resolves.toEqual({
      ok: false,
      error: 'rate limited',
      status: 502,
    })

    const failedUpdate = mockMeetingQuery({ data: meetingRow, error: null })
    failedUpdate.updateEq.mockResolvedValueOnce({ error: { message: 'write failed' } })
    await expect(sendMeetingFeedbackEmailForMeetingId('mtg-1')).resolves.toEqual({
      ok: false,
      error: 'Email sent but failed to record status',
      status: 500,
    })
  })
})
