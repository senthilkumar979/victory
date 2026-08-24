import { beforeEach, describe, expect, it, vi } from 'vitest'

const { authMock, publishMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  publishMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: authMock,
}))

vi.mock('@/lib/logsnag/publish', () => ({
  publishLogSnagEvent: (...args: unknown[]) => publishMock(...args),
}))

import { POST } from './route'

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/logsnag/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

describe('POST /api/logsnag/track', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue({ userId: 'user-1' })
    publishMock.mockResolvedValue({ ok: true })
  })

  it('rejects invalid JSON and invalid channels', async () => {
    const invalidJson = await POST(makeRequest('{'))
    expect(invalidJson.status).toBe(400)
    await expect(invalidJson.json()).resolves.toEqual({ error: 'Invalid JSON body' })

    const badChannel = await POST(makeRequest({ channel: 'Not Valid!' }))
    expect(badChannel.status).toBe(400)
    await expect(badChannel.json()).resolves.toEqual({
      error: 'Invalid or missing channel',
    })
    expect(publishMock).not.toHaveBeenCalled()
  })

  it('defaults the event name, lowercases tags, and drops invalid tag values', async () => {
    const response = await POST(
      makeRequest({
        channel: 'web-analytics',
        description: '  Home  ',
        icon: 'abcdefghij',
        tags: {
          Path: '/home',
          count: 3,
          ok: true,
          nested: { nope: true },
          ['k'.repeat(41)]: 'too-long-key',
        },
      }),
    )

    expect(publishMock).toHaveBeenCalledWith({
      channel: 'web-analytics',
      event: 'Page view',
      description: 'Home',
      icon: 'abcdefgh',
      user_id: 'user-1',
      tags: { path: '/home', count: 3, ok: true },
    })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
  })

  it('returns skipped publishes as 200 and failures as 502', async () => {
    publishMock.mockResolvedValueOnce({ ok: false, skipped: true })
    const skipped = await POST(makeRequest({ channel: 'web', event: 'Click' }))
    expect(skipped.status).toBe(200)
    await expect(skipped.json()).resolves.toEqual({ ok: true, skipped: true })

    publishMock.mockResolvedValueOnce({ ok: false, error: 'timeout' })
    const failed = await POST(makeRequest({ channel: 'web', event: 'Click' }))
    expect(failed.status).toBe(502)
    await expect(failed.json()).resolves.toEqual({ error: 'timeout' })
  })
})
