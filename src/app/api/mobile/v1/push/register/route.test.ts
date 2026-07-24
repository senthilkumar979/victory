import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const {
  authenticateMobileAdminMock,
  getMobileDbMock,
  mobileErrorResponseMock,
} = vi.hoisted(() => ({
  authenticateMobileAdminMock: vi.fn(),
  getMobileDbMock: vi.fn(),
  mobileErrorResponseMock: vi.fn(() =>
    Response.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 },
    ),
  ),
}))

vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileAdmin: authenticateMobileAdminMock,
}))

vi.mock('@/lib/mobile/mobileApiUtils', () => ({
  getMobileDb: getMobileDbMock,
  mobileErrorResponse: mobileErrorResponseMock,
}))

import { POST } from './route'

function createUpsertDb(result: {
  data: Record<string, unknown> | null
  error: { message: string } | null
}) {
  const single = vi.fn().mockResolvedValue(result)
  const select = vi.fn().mockReturnValue({ single })
  const upsert = vi.fn().mockReturnValue({ select })
  const from = vi.fn().mockReturnValue({ upsert })
  return { db: { from }, from, upsert, select, single }
}

describe('POST /api/mobile/v1/push/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticateMobileAdminMock.mockResolvedValue({
      user: { id: 'admin-1' },
      email: 'admin@example.com',
      userId: 'admin-1',
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('short-circuits before database access when admin auth fails', async () => {
    const unauthorized = Response.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
    authenticateMobileAdminMock.mockResolvedValue({ error: unauthorized })

    const response = await POST(
      new Request('http://localhost/api/mobile/v1/push/register', {
        method: 'POST',
        body: JSON.stringify({
          deviceId: 'device-1',
          pushToken: 'token-1',
        }),
      }),
    )

    expect(response).toBe(unauthorized)
    expect(getMobileDbMock).not.toHaveBeenCalled()
  })

  it('rejects missing deviceId or pushToken with a validation error', async () => {
    const response = await POST(
      new Request('http://localhost/api/mobile/v1/push/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: '   ',
          platform: 'ios',
          pushToken: 'token-1',
        }),
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'deviceId and pushToken are required',
      code: 'VALIDATION_ERROR',
    })
    expect(getMobileDbMock).not.toHaveBeenCalled()
  })

  it('upserts a trimmed token and defaults unknown platforms to android', async () => {
    const subscription = {
      id: 'sub-1',
      user_id: 'admin-1',
      device_id: 'device-1',
      platform: 'android',
      push_token: 'expo-token',
      created_at: '2026-07-24T00:00:00.000Z',
    }
    const { db, from, upsert } = createUpsertDb({
      data: subscription,
      error: null,
    })
    getMobileDbMock.mockReturnValue(db)

    const response = await POST(
      new Request('http://localhost/api/mobile/v1/push/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: '  device-1  ',
          platform: 'web',
          pushToken: '  expo-token  ',
        }),
      }),
    )

    expect(from).toHaveBeenCalledWith('mobile_push_subscriptions')
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'admin-1',
        device_id: 'device-1',
        platform: 'android',
        push_token: 'expo-token',
      }),
      { onConflict: 'user_id,device_id' },
    )
    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({ data: subscription })
  })

  it('preserves ios when the platform is explicitly provided', async () => {
    const { db, upsert } = createUpsertDb({
      data: { id: 'sub-ios' },
      error: null,
    })
    getMobileDbMock.mockReturnValue(db)

    await POST(
      new Request('http://localhost/api/mobile/v1/push/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: 'iphone-1',
          platform: 'ios',
          pushToken: 'ios-token',
        }),
      }),
    )

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        platform: 'ios',
        device_id: 'iphone-1',
        push_token: 'ios-token',
      }),
      { onConflict: 'user_id,device_id' },
    )
  })

  it('returns an internal error when the upsert fails', async () => {
    const { db } = createUpsertDb({
      data: null,
      error: { message: 'unique violation' },
    })
    getMobileDbMock.mockReturnValue(db)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const response = await POST(
      new Request('http://localhost/api/mobile/v1/push/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: 'device-1',
          pushToken: 'token-1',
        }),
      }),
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Could not register push token',
      code: 'INTERNAL_ERROR',
    })
    expect(consoleError).toHaveBeenCalled()
  })
})
