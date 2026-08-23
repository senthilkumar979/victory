import { beforeEach, describe, expect, it, vi } from 'vitest'

const { resendState, buildHtmlMock } = vi.hoisted(() => ({
  resendState: {
    client: {
      emails: { send: vi.fn() },
    } as { emails: { send: ReturnType<typeof vi.fn> } } | null,
  },
  buildHtmlMock: vi.fn(() => '<html>contact</html>'),
}))

vi.mock('@/lib/resend', () => ({
  get resend() {
    return resendState.client
  },
}))

vi.mock('@/lib/contactFormEmailHtml', () => ({
  buildContactFormEmailHtml: (...args: unknown[]) => buildHtmlMock(...args),
}))

import { POST } from './route'

const validBody = {
  fullName: 'Jane Doe',
  company: 'Acme',
  email: 'jane@example.com',
  message: 'Hello there',
}

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }) as never
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resendState.client = { emails: { send: vi.fn() } }
    resendState.client.emails.send.mockResolvedValue({
      data: { id: 'msg_1' },
      error: null,
    })
    buildHtmlMock.mockReturnValue('<html>contact</html>')
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('returns 500 when Resend is not configured', async () => {
    resendState.client = null

    const response = await POST(makeRequest(validBody))

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Email service not configured',
    })
  })

  it('rejects invalid JSON and schema failures before sending', async () => {
    const invalidJson = await POST(makeRequest('{'))
    expect(invalidJson.status).toBe(400)
    await expect(invalidJson.json()).resolves.toEqual({ error: 'Invalid JSON body' })

    const invalid = await POST(
      makeRequest({ fullName: '', company: '', email: 'bad', message: '' }),
    )
    expect(invalid.status).toBe(400)
    await expect(invalid.json()).resolves.toMatchObject({ error: 'Validation failed' })
    expect(resendState.client?.emails.send).not.toHaveBeenCalled()
  })

  it('maps Resend provider errors to 502', async () => {
    resendState.client!.emails.send.mockResolvedValueOnce({
      error: { message: 'mailbox unavailable' },
    })

    const response = await POST(makeRequest(validBody))

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({
      error: 'mailbox unavailable',
    })
  })

  it('sends to both recipients and maps unexpected errors', async () => {
    const ok = await POST(makeRequest(validBody))

    expect(buildHtmlMock).toHaveBeenCalledWith({
      fullName: 'Jane Doe',
      company: 'Acme',
      email: 'jane@example.com',
      message: 'Hello there',
    })
    expect(resendState.client?.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['senthilkumar@mentorbridge.in', 'senthilk979@gmail.com'],
        subject: 'Contact Us form submitted',
        html: '<html>contact</html>',
        replyTo: 'jane@example.com',
      }),
    )
    expect(ok.status).toBe(200)
    await expect(ok.json()).resolves.toEqual({ id: 'msg_1' })

    resendState.client!.emails.send.mockRejectedValueOnce(new Error('timeout'))
    const boom = await POST(makeRequest(validBody))
    expect(boom.status).toBe(500)
    await expect(boom.json()).resolves.toEqual({
      error: 'Unexpected error while sending email',
    })
  })
})
