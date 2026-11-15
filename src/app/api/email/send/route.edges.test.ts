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
    body: JSON.stringify(body),
  }) as never
}

const validBody = {
  to: 'team@example.com',
  subject: 'Hello',
  html: '<p>Hi</p>',
}

describe('POST /api/email/send edges', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resendState.client = { emails: { send: vi.fn() } }
    resendState.client.emails.send.mockResolvedValue({
      data: { id: 'email_1' },
      error: null,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects an empty recipient, subject, or body before sending', async () => {
    for (const body of [
      { ...validBody, to: '' },
      { ...validBody, subject: '' },
      { ...validBody, html: '' },
    ]) {
      const response = await POST(makeRequest(body))
      expect(response.status).toBe(400)
      await expect(response.json()).resolves.toEqual({
        error: 'Missing required fields: to, subject, html',
      })
    }

    expect(resendState.client?.emails.send).not.toHaveBeenCalled()
  })

  it('keeps an empty from address and forwards an array of recipients', async () => {
    const response = await POST(
      makeRequest({
        ...validBody,
        to: ['a@example.com', 'b@example.com'],
        from: '',
      }),
    )

    expect(resendState.client?.emails.send).toHaveBeenCalledWith({
      from: '',
      to: ['a@example.com', 'b@example.com'],
      subject: 'Hello',
      html: '<p>Hi</p>',
    })
    expect(response.status).toBe(200)
  })

  it('uses a generic message when the provider error has no message', async () => {
    resendState.client!.emails.send.mockResolvedValueOnce({ error: {} })

    const response = await POST(makeRequest(validBody))

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to send email',
    })
  })
})
