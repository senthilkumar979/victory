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
  return new Request('http://localhost/api/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }) as never
}

const validBody = {
  to: 'team@example.com',
  subject: 'Hello',
  html: '<p>Hi</p>',
}

describe('POST /api/email/send', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resendState.client = { emails: { send: vi.fn() } }
    resendState.client.emails.send.mockResolvedValue({
      data: { id: 'email_1' },
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

  it('rejects invalid JSON and missing required fields', async () => {
    const invalidJson = await POST(makeRequest('{'))
    expect(invalidJson.status).toBe(400)
    await expect(invalidJson.json()).resolves.toEqual({ error: 'Invalid JSON body' })

    const missing = await POST(makeRequest({ to: 'team@example.com' }))
    expect(missing.status).toBe(400)
    await expect(missing.json()).resolves.toEqual({
      error: 'Missing required fields: to, subject, html',
    })
    expect(resendState.client?.emails.send).not.toHaveBeenCalled()
  })

  it('sends with the default from address and returns the message id', async () => {
    const response = await POST(makeRequest(validBody))

    expect(resendState.client?.emails.send).toHaveBeenCalledWith({
      from: 'senthilkumar@mentorbridge.in',
      to: 'team@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
    })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ id: 'email_1' })
  })

  it('maps Resend errors to 502 and unexpected throws to 500', async () => {
    resendState.client!.emails.send.mockResolvedValueOnce({
      error: { message: 'quota exceeded' },
    })
    const quota = await POST(makeRequest(validBody))
    expect(quota.status).toBe(502)
    await expect(quota.json()).resolves.toEqual({ error: 'quota exceeded' })

    resendState.client!.emails.send.mockRejectedValueOnce(new Error('network'))
    const unexpected = await POST(
      makeRequest({ ...validBody, from: 'mail@mentorbridge.in' }),
    )
    expect(unexpected.status).toBe(500)
    await expect(unexpected.json()).resolves.toEqual({
      error: 'Unexpected error while sending email',
    })
  })
})
