import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { resendState, renderPdfMock } = vi.hoisted(() => ({
  resendState: {
    client: {
      emails: { send: vi.fn() },
    } as { emails: { send: ReturnType<typeof vi.fn> } } | null,
  },
  renderPdfMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/resend', () => ({
  get resend() {
    return resendState.client
  },
}))

vi.mock('@/lib/renderAwardWinnerPdf', () => ({
  renderAwardWinnerPdfBuffer: (...args: unknown[]) => renderPdfMock(...args),
}))

import { RESEND_TEMPLATE_IDS } from '@/constants/ThirdPartyConstants'

import { POST } from './route'

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/email/send-award-winner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }) as never
}

const validBody = {
  recipientEmail: 'winner@example.com',
  awardWinnerDisplayName: 'Ada Lovelace',
  awardCategoryName: 'Excellence',
}

describe('POST /api/email/send-award-winner', () => {
  const originalTemplateId = RESEND_TEMPLATE_IDS.AWARD_WINNER

  beforeEach(() => {
    vi.clearAllMocks()
    RESEND_TEMPLATE_IDS.AWARD_WINNER = originalTemplateId
    resendState.client = { emails: { send: vi.fn() } }
    renderPdfMock.mockResolvedValue(Buffer.from('pdf'))
    resendState.client.emails.send.mockResolvedValue({
      data: { id: 'email_1' },
      error: null,
    })
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    RESEND_TEMPLATE_IDS.AWARD_WINNER = originalTemplateId
  })

  it('returns 500 when Resend or the award template is missing', async () => {
    resendState.client = null
    const noResend = await POST(makeRequest(validBody))
    expect(noResend.status).toBe(500)
    await expect(noResend.json()).resolves.toEqual({
      error: 'Email service not configured',
    })

    resendState.client = { emails: { send: vi.fn() } }
    RESEND_TEMPLATE_IDS.AWARD_WINNER = '  '
    const noTemplate = await POST(makeRequest(validBody))
    expect(noTemplate.status).toBe(500)
    await expect(noTemplate.json()).resolves.toEqual({
      error: 'Award winner template not configured',
    })
    expect(renderPdfMock).not.toHaveBeenCalled()
  })

  it('rejects invalid JSON and invalid award payloads', async () => {
    const invalidJson = await POST(makeRequest('{'))
    expect(invalidJson.status).toBe(400)
    await expect(invalidJson.json()).resolves.toMatchObject({
      error: 'Invalid JSON body',
    })

    const invalid = await POST(
      makeRequest({ recipientEmail: 'not-an-email', awardCategoryName: '' }),
    )
    expect(invalid.status).toBe(400)
    await expect(invalid.json()).resolves.toMatchObject({ error: 'Invalid request' })
    expect(renderPdfMock).not.toHaveBeenCalled()
  })

  it('maps PDF render failures to 500 without sending mail', async () => {
    renderPdfMock.mockRejectedValueOnce(new Error('pdf boom'))

    const response = await POST(makeRequest(validBody))

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to generate award certificate PDF',
    })
    expect(resendState.client?.emails.send).not.toHaveBeenCalled()
  })

  it('falls back to the email local-part and maps Resend failures to 502', async () => {
    resendState.client!.emails.send.mockResolvedValueOnce({
      error: { message: 'quota exceeded', name: 'rate_limit' },
    })

    const response = await POST(
      makeRequest({
        recipientEmail: 'winner@example.com',
        awardWinnerDisplayName: '   ',
        awardCategoryName: 'Excellence',
      }),
    )

    expect(renderPdfMock).toHaveBeenCalledWith({
      recipientName: 'winner',
      awardCategoryName: 'Excellence',
    })
    expect(resendState.client?.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'winner@example.com',
        cc: 'mentorbridge-2026-offline@googlegroups.com',
        template: expect.objectContaining({
          variables: { award_winner: 'winner', award_name: 'Excellence' },
        }),
      }),
    )
    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({ error: 'quota exceeded' })
  })

  it('sends the certificate on success and maps unexpected send errors', async () => {
    const ok = await POST(makeRequest(validBody))
    expect(ok.status).toBe(200)
    await expect(ok.json()).resolves.toEqual({ id: 'email_1' })

    resendState.client!.emails.send.mockRejectedValueOnce(new Error('network'))
    const boom = await POST(makeRequest(validBody))
    expect(boom.status).toBe(500)
    await expect(boom.json()).resolves.toEqual({
      error: 'Unexpected error while sending email',
    })
  })
})
