import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { cookieSetMock, authMock } = vi.hoisted(() => ({
  cookieSetMock: vi.fn(),
  authMock: vi.fn(),
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: authMock,
}))

vi.mock('next/headers', () => ({
  cookies: async () => ({
    set: cookieSetMock,
  }),
}))

import { GET } from './route'

describe('GET /api/linkedin/oauth/start', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue({ userId: 'admin-1' })
    vi.stubEnv('LINKEDIN_CLIENT_ID', 'client-123')
    delete process.env.LINKEDIN_REDIRECT_URI
    delete process.env.LINKEDIN_OAUTH_SCOPES
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      '11111111-1111-4111-8111-111111111111',
    )
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('returns 401 when the caller is unauthenticated', async () => {
    authMock.mockResolvedValue({ userId: null })

    const response = await GET()

    expect(response.status).toBe(401)
    expect(cookieSetMock).not.toHaveBeenCalled()
  })

  it('returns 500 when LINKEDIN_CLIENT_ID is missing', async () => {
    vi.stubEnv('LINKEDIN_CLIENT_ID', '')

    const response = await GET()

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'LINKEDIN_CLIENT_ID is not set',
    })
  })

  it('stores oauth state and redirects to LinkedIn with default scopes', async () => {
    const response = await GET()

    expect(cookieSetMock).toHaveBeenCalledWith(
      'linkedin_oauth_state',
      '11111111-1111-4111-8111-111111111111',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 600,
      }),
    )
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=client-123&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Flinkedin%2Foauth%2Fcallback&state=11111111-1111-4111-8111-111111111111&scope=w_organization_social',
    )
  })

  it('uses env overrides for redirect URI and scopes', async () => {
    vi.stubEnv('LINKEDIN_REDIRECT_URI', 'https://app.example.com/api/linkedin/oauth/callback')
    vi.stubEnv('LINKEDIN_OAUTH_SCOPES', 'w_organization_social r_organization_social')

    const response = await GET()
    const location = response.headers.get('location') ?? ''

    expect(location).toContain(
      'redirect_uri=https%3A%2F%2Fapp.example.com%2Fapi%2Flinkedin%2Foauth%2Fcallback',
    )
    expect(location).toContain(
      'scope=w_organization_social+r_organization_social',
    )
  })
})
