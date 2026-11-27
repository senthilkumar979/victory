import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
}))

vi.mock('@/lib/resend', () => ({
  resend: {
    emails: {
      send: sendMock,
    },
  },
}))

import { POST } from './route'

function contactRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3001/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', host: 'localhost:3001' },
    body: JSON.stringify(body),
  })
}

const validBody = {
  fullName: 'Ada & "Lee"',
  company: '',
  email: 'jane@example.com',
  message: 'Hello\n<script>alert(1)</script>',
}

describe('POST /api/contact edges', () => {
  beforeEach(() => {
    sendMock.mockReset()
  })

  it('sends an empty company and escapes HTML in the message', async () => {
    sendMock.mockResolvedValue({ data: { id: 'email-1' }, error: null })

    const response = await POST(contactRequest(validBody))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ id: 'email-1' })
    expect(sendMock).toHaveBeenCalledTimes(1)
    const payload = sendMock.mock.calls[0][0] as {
      replyTo: string
      html: string
    }
    expect(payload.replyTo).toBe('jane@example.com')
    expect(payload.html).toContain('—')
    expect(payload.html).toContain('Ada &amp; &quot;Lee&quot;')
    expect(payload.html).toContain('Hello<br/>')
    expect(payload.html).toContain('&lt;script&gt;')
    expect(payload.html).not.toContain('<script>')
  })

  it('maps a provider error without a message to the generic 502', async () => {
    sendMock.mockResolvedValue({ data: null, error: {} })

    const response = await POST(contactRequest(validBody))

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to send email',
    })
  })
})
