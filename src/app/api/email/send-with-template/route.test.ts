import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { resendState } = vi.hoisted(() => ({
  resendState: {
    client: {
      emails: { send: vi.fn() },
    } as { emails: { send: ReturnType<typeof vi.fn> } } | null,
  },
}))

vi.mock('@/lib/resend', () => ({
  get resend() {
    return resendState.client
  },
}))

import { POST } from './route'

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/email/send-with-template', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }) as never
}

const validBody = {
  to: 'team@example.com',
  templateId: 'tmpl_assignment',
  subject: 'New assignment',
  variables: { assignment_title: 'Week 1' },
}

describe('POST /api/email/send-with-template', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resendState.client = { emails: { send: vi.fn() } }
    resendState.client.emails.send.mockResolvedValue({
      data: { id: 'email_tmpl_1' },
      error: null,
    })
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 500 when Resend is not configured', async () => {
    resendState.client = null

    const response = await POST(makeRequest(validBody))

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Email service not configured',
    })
  })

  it('rejects invalid JSON and missing to/templateId', async () => {
    const invalidJson = await POST(makeRequest('{'))
    expect(invalidJson.status).toBe(400)
    await expect(invalidJson.json()).resolves.toEqual({
      error: 'Invalid JSON body',
    })

    const missing = await POST(makeRequest({ to: 'team@example.com' }))
    expect(missing.status).toBe(400)
    await expect(missing.json()).resolves.toEqual({
      error: 'Missing required fields: to, templateId',
    })
    expect(resendState.client?.emails.send).not.toHaveBeenCalled()
  })

  it('sends with the default from address, optional cc, and template variables', async () => {
    const response = await POST(
      makeRequest({ ...validBody, cc: 'ops@example.com' }),
    )

    expect(resendState.client?.emails.send).toHaveBeenCalledWith({
      from: 'mail@mentorbridge.in',
      to: 'team@example.com',
      cc: 'ops@example.com',
      subject: 'New assignment',
      template: {
        id: 'tmpl_assignment',
        variables: { assignment_title: 'Week 1' },
      },
    })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ id: 'email_tmpl_1' })
  })

  it('omits cc when not provided and uses a custom from address', async () => {
    await POST(makeRequest({ ...validBody, from: 'alerts@mentorbridge.in' }))

    expect(resendState.client?.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'alerts@mentorbridge.in',
        cc: undefined,
      }),
    )
  })

  it('maps Resend errors to 502 with a fallback message and unexpected throws to 500', async () => {
    resendState.client!.emails.send.mockResolvedValueOnce({
      error: { name: 'rate_limit_exceeded' },
    })
    const fallback = await POST(makeRequest(validBody))
    expect(fallback.status).toBe(502)
    await expect(fallback.json()).resolves.toEqual({
      error: 'Failed to send email',
    })

    resendState.client!.emails.send.mockResolvedValueOnce({
      error: { message: 'template not found' },
    })
    const named = await POST(makeRequest(validBody))
    expect(named.status).toBe(502)
    await expect(named.json()).resolves.toEqual({ error: 'template not found' })

    resendState.client!.emails.send.mockRejectedValueOnce(new Error('network'))
    const unexpected = await POST(makeRequest(validBody))
    expect(unexpected.status).toBe(500)
    await expect(unexpected.json()).resolves.toEqual({
      error: 'Unexpected error while sending email',
    })
  })
})
