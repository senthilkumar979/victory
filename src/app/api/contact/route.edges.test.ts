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

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as never
}

describe('POST /api/contact edges', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resendState.client = { emails: { send: vi.fn() } }
    resendState.client.emails.send.mockResolvedValue({
      data: { id: 'msg_1' },
      error: null,
    })
    buildHtmlMock.mockReturnValue('<html>contact</html>')
  })

  it('allows an empty company and still sends the form', async () => {
    const response = await POST(
      makeRequest({
        fullName: 'Jane Doe',
        company: '',
        email: 'jane@example.com',
        message: 'Hello there',
      }),
    )

    expect(buildHtmlMock).toHaveBeenCalledWith({
      fullName: 'Jane Doe',
      company: '',
      email: 'jane@example.com',
      message: 'Hello there',
    })
    expect(resendState.client?.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({ replyTo: 'jane@example.com' }),
    )
    expect(response.status).toBe(200)
  })

  it('uses a generic message when the provider error has no message', async () => {
    resendState.client!.emails.send.mockResolvedValueOnce({ error: {} })

    const response = await POST(
      makeRequest({
        fullName: 'Jane Doe',
        company: 'Acme',
        email: 'jane@example.com',
        message: 'Hello there',
      }),
    )

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to send email',
    })
  })
})
