import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { auth } from '@clerk/nextjs/server'

import {
  getLinkedInOAuthScopes,
  getLinkedInRedirectUri,
} from '@/lib/linkedin/oauthConfig'

/**
 * Starts LinkedIn OAuth. Visit while logged into the app (Clerk) so only admins hit this.
 * Opens LinkedIn consent; after approval, user lands on /api/linkedin/oauth/callback with ?code=
 */
export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID?.trim()
  if (!clientId) {
    return NextResponse.json(
      { error: 'LINKEDIN_CLIENT_ID is not set' },
      { status: 500 },
    )
  }

  const state = crypto.randomUUID()
  const store = await cookies()
  store.set('linkedin_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600,
    path: '/',
  })

  const redirectUri = getLinkedInRedirectUri()
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: getLinkedInOAuthScopes(),
  })

  const url = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`
  return NextResponse.redirect(url)
}
