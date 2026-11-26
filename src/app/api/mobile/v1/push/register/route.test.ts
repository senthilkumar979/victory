import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextResponse } from 'next/server'

const { authenticateMobileAdminMock, dbState } = vi.hoisted(() => ({
  authenticateMobileAdminMock: vi.fn(),
  dbState: {
    client: null as null | { from: ReturnType<typeof vi.fn> },
  },
}))

vi.mock('server-only', () => ({}))
vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileAdmin: authenticateMobileAdminMock,
}))
vi.mock('@/lib/supabaseAdmin', () => ({
  get supabaseAdmin() {
    return dbState.client
  },
}))

import { POST } from './route'

const admin = {
  user: { id: 'admin-1' },
  email: 'admin@example.com',
  userId: 'admin-1',
}

function registerRequest(body: unknown) {
  return new Request('http://localhost:3001/api/mobile/v1/push/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

function pushDb(result: { data: unknown; error: unknown }) {
  const single = vi.fn().mockResolvedValue(result)
  const select = vi.fn(() => ({ single }))
  const upsert = vi.fn(() => ({ select }))
  const from = vi.fn(() => ({ upsert }))
  dbState.client = { from }
  return { from, upsert, select }
}

describe('POST /api/mobile/v1/push/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    authenticateMobileAdminMock.mockResolvedValue(admin)
    dbState.client = null
  })

  it('returns the admin auth error and does not write', async () => {
    const error = NextResponse.json(
      { error: 'Forbidden', code: 'FORBIDDEN' },
      { status: 403 },
    )
    authenticateMobileAdminMock.mockResolvedValue({ error })
    const { from } = pushDb({ data: null, error: null })

    const response = await POST(
      registerRequest({ deviceId: 'phone', pushToken: 'token' }),
    )

    expect(response).toBe(error)
    expect(from).not.toHaveBeenCalled()
  })

  it('rejects a blank device id or push token', async () => {
    const missingDevice = await POST(
      registerRequest({ deviceId: '   ', pushToken: 'token' }),
    )
    const missingToken = await POST(
      registerRequest({ deviceId: 'phone', pushToken: '  ' }),
    )

    expect(missingDevice.status).toBe(400)
    expect(missingToken.status).toBe(400)
    await expect(missingDevice.json()).resolves.toEqual({
      error: 'deviceId and pushToken are required',
      code: 'VALIDATION_ERROR',
    })
    expect(dbState.client).toBeNull()
  })

  it('stores android for any platform other than ios and trims the ids', async () => {
    const saved = { id: 'sub-1', platform: 'android' }
    const { upsert, select } = pushDb({ data: saved, error: null })

    const response = await POST(
      registerRequest({
        deviceId: ' phone ',
        pushToken: ' token ',
        platform: 'web',
      }),
    )

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({ data: saved })
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'admin-1',
        device_id: 'phone',
        platform: 'android',
        push_token: 'token',
      }),
      { onConflict: 'user_id,device_id' },
    )
    expect(select).toHaveBeenCalledWith(
      'id, user_id, device_id, platform, push_token, created_at',
    )
  })

  it('stores ios only for the exact platform value', async () => {
    const { upsert } = pushDb({ data: { id: 'sub-2' }, error: null })

    await POST(
      registerRequest({
        deviceId: 'phone',
        pushToken: 'token',
        platform: 'ios',
      }),
    )

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ platform: 'ios' }),
      { onConflict: 'user_id,device_id' },
    )
  })

  it('returns a generic 500 when the database rejects the write', async () => {
    pushDb({ data: null, error: { message: 'duplicate key secret' } })

    const response = await POST(
      registerRequest({ deviceId: 'phone', pushToken: 'token' }),
    )
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({
      error: 'Could not register push token',
      code: 'INTERNAL_ERROR',
    })
    expect(JSON.stringify(body)).not.toContain('secret')
  })

  it('maps a missing database client to service unavailable', async () => {
    const response = await POST(
      registerRequest({ deviceId: 'phone', pushToken: 'token' }),
    )

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      error: 'Server database is not configured.',
      code: 'SERVICE_UNAVAILABLE',
      details: {},
    })
  })

  it('hides invalid JSON behind the generic mobile error', async () => {
    const response = await POST(registerRequest('{'))
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    })
  })
})
