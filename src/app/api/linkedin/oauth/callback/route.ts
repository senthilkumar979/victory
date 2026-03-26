import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import {
  getLinkedInOAuthScopes,
  getLinkedInRedirectUri,
} from '@/lib/linkedin/oauthConfig'

interface TokenResponse {
  access_token?: string
  expires_in?: number
  refresh_token?: string
  refresh_token_expires_in?: number
  scope?: string
  error?: string
  error_description?: string
}

function htmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * LinkedIn redirects here with ?code=&state= or ?error=
 * Exchanges code for access_token (server-side, uses LINKEDIN_CLIENT_SECRET).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const err = searchParams.get('error')
  const desc = searchParams.get('error_description')
  if (err) {
    return new NextResponse(
      `<!DOCTYPE html><html><body><pre>${htmlEscape(err)}: ${htmlEscape(desc ?? '')}</pre></body></html>`,
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }

  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const store = await cookies()
  const expected = store.get('linkedin_oauth_state')?.value
  store.delete('linkedin_oauth_state')

  if (!code || !state || !expected || state !== expected) {
    return new NextResponse(
      '<!DOCTYPE html><html><body><p>Invalid or missing OAuth state. Start again from <code>/api/linkedin/oauth/start</code>.</p></body></html>',
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID?.trim()
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        error:
          'LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET must be set on the server',
      },
      { status: 500 },
    )
  }

  const redirectUri = getLinkedInRedirectUri()
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  })

  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  const data = (await tokenRes.json()) as TokenResponse
  if (!tokenRes.ok || !data.access_token) {
    const msg =
      data.error_description ?? data.error ?? JSON.stringify(data, null, 2)
    return new NextResponse(
      `<!DOCTYPE html><html><body><pre>${htmlEscape(msg)}</pre></body></html>`,
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }

  const expiresIn =
    typeof data.expires_in === 'number'
      ? `${data.expires_in} seconds (~${Math.round(data.expires_in / 86400)} days)`
      : 'unknown'
  const hasRefresh = Boolean(data.refresh_token)

  const tokenDisplay = htmlEscape(data.access_token)
  const scopesUsed = htmlEscape(data.scope ?? getLinkedInOAuthScopes())

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><title>LinkedIn token</title></head>
<body style="font-family:system-ui,sans-serif;max-width:42rem;margin:2rem auto;padding:0 1rem;">
<h1>LinkedIn access token</h1>
<p>Copy the value below into <code>LINKEDIN_ACCESS_TOKEN</code> in <code>.env.local</code> (local) or your host secrets (production).</p>
<p><strong>Expires in:</strong> ${htmlEscape(expiresIn)}</p>
<p><strong>Scopes granted:</strong> ${scopesUsed}</p>
<p><strong>Refresh token:</strong> ${hasRefresh ? 'yes (store securely and implement refresh before expiry)' : 'no — you will need to visit /api/linkedin/oauth/start again when the access token expires'}</p>
<label for="t">Access token</label><br/>
<textarea id="t" readonly rows="6" style="width:100%;font-family:monospace;font-size:12px;">${tokenDisplay}</textarea>
<p style="color:#666;font-size:14px;">Do not share this page or commit tokens to git.</p>
</body></html>`

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
