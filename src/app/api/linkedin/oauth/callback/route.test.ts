import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { cookieGetMock, cookieDeleteMock } = vi.hoisted(() => ({
  cookieGetMock: vi.fn(),
  cookieDeleteMock: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: cookieGetMock,
    delete: cookieDeleteMock,
  }),
}))

import { GET } from './route'

function makeRequest(query: string) {
  return new NextRequest(
    `http://localhost:3000/api/linkedin/oauth/callback${query}`,
  )
}

describe('GET /api/linkedin/oauth/callback', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('LINKEDIN_CLIENT_ID', 'client-123')
    vi.stubEnv('LINKEDIN_CLIENT_SECRET', 'secret-456')
    delete process.env.LINKEDIN_REDIRECT_URI
    delete process.env.LINKEDIN_OAUTH_SCOPES
    cookieGetMock.mockReturnValue({ value: 'expected-state' })
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('returns escaped LinkedIn error text without exchanging a code', async () => {
    const response = await GET(
      makeRequest(
        '?error=access_denied&error_description=<script>alert(1)</script>',
      ),
    )

    expect(response.status).toBe(400)
    expect(response.headers.get('content-type')).toContain('text/html')
    const html = await response.text()
    expect(html).toContain('access_denied: &lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(fetchMock).not.toHaveBeenCalled()
    expect(cookieDeleteMock).not.toHaveBeenCalled()
  })

  it('rejects missing or mismatched OAuth state and always clears the cookie', async () => {
    const mismatched = await GET(
      makeRequest('?code=auth-code&state=other-state'),
    )
    expect(mismatched.status).toBe(400)
    expect(await mismatched.text()).toContain('Invalid or missing OAuth state')
    expect(cookieDeleteMock).toHaveBeenCalledWith('linkedin_oauth_state')
    expect(fetchMock).not.toHaveBeenCalled()

    cookieGetMock.mockReturnValue(undefined)
    const missingCookie = await GET(
      makeRequest('?code=auth-code&state=expected-state'),
    )
    expect(missingCookie.status).toBe(400)

    const missingCode = await GET(makeRequest('?state=expected-state'))
    expect(missingCode.status).toBe(400)
  })

  it('returns 500 when LinkedIn client secrets are not configured', async () => {
    vi.stubEnv('LINKEDIN_CLIENT_ID', '')
    vi.stubEnv('LINKEDIN_CLIENT_SECRET', '')

    const response = await GET(
      makeRequest('?code=auth-code&state=expected-state'),
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error:
        'LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET must be set on the server',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('escapes token-endpoint error HTML', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: 'invalid_grant',
          error_description: '<img src=x onerror=alert(1)>',
        }),
        { status: 400 },
      ),
    )

    const response = await GET(
      makeRequest('?code=auth-code&state=expected-state'),
    )

    expect(response.status).toBe(400)
    const html = await response.text()
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
    expect(html).not.toContain('<img src=x')
  })

  it('renders a successful token page with escaped token and expiry', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: '</textarea><script>steal()</script>',
          expires_in: 5_184_000,
          refresh_token: 'refresh-1',
          scope: 'w_organization_social',
        }),
        { status: 200 },
      ),
    )

    const response = await GET(
      makeRequest('?code=auth-code&state=expected-state'),
    )

    expect(fetchMock).toHaveBeenCalledWith(
      'https://www.linkedin.com/oauth/v2/accessToken',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }),
    )
    const [, init] = fetchMock.mock.calls[0] as [string, { body: URLSearchParams }]
    expect(init.body.get('code')).toBe('auth-code')
    expect(init.body.get('client_id')).toBe('client-123')
    expect(init.body.get('redirect_uri')).toBe(
      'http://localhost:3000/api/linkedin/oauth/callback',
    )

    expect(response.status).toBe(200)
    const html = await response.text()
    expect(html).toContain('&lt;/textarea&gt;&lt;script&gt;steal()&lt;/script&gt;')
    expect(html).not.toContain('</textarea><script>steal()</script>')
    expect(html).toContain('5184000 seconds (~60 days)')
    expect(html).toContain('Refresh token:</strong> yes')
    expect(html).toContain('w_organization_social')
  })
})
