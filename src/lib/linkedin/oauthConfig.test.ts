import { afterEach, describe, expect, it } from 'vitest'

import {
  getLinkedInOAuthScopes,
  getLinkedInRedirectUri,
} from './oauthConfig'

const ORIGINAL_REDIRECT = process.env.LINKEDIN_REDIRECT_URI
const ORIGINAL_SCOPES = process.env.LINKEDIN_OAUTH_SCOPES

afterEach(() => {
  if (ORIGINAL_REDIRECT === undefined) delete process.env.LINKEDIN_REDIRECT_URI
  else process.env.LINKEDIN_REDIRECT_URI = ORIGINAL_REDIRECT

  if (ORIGINAL_SCOPES === undefined) delete process.env.LINKEDIN_OAUTH_SCOPES
  else process.env.LINKEDIN_OAUTH_SCOPES = ORIGINAL_SCOPES
})

describe('getLinkedInRedirectUri', () => {
  it('defaults to the local OAuth callback when unset', () => {
    delete process.env.LINKEDIN_REDIRECT_URI

    expect(getLinkedInRedirectUri()).toBe(
      'http://localhost:3000/api/linkedin/oauth/callback',
    )
  })

  it('uses a trimmed env override and falls back when the value is whitespace', () => {
    process.env.LINKEDIN_REDIRECT_URI =
      '  https://www.mentorbridge.in/api/linkedin/oauth/callback  '
    expect(getLinkedInRedirectUri()).toBe(
      'https://www.mentorbridge.in/api/linkedin/oauth/callback',
    )

    process.env.LINKEDIN_REDIRECT_URI = '   '
    expect(getLinkedInRedirectUri()).toBe(
      'http://localhost:3000/api/linkedin/oauth/callback',
    )
  })
})

describe('getLinkedInOAuthScopes', () => {
  it('defaults to organization social posting when unset or whitespace', () => {
    delete process.env.LINKEDIN_OAUTH_SCOPES
    expect(getLinkedInOAuthScopes()).toBe('w_organization_social')

    process.env.LINKEDIN_OAUTH_SCOPES = '  '
    expect(getLinkedInOAuthScopes()).toBe('w_organization_social')
  })

  it('uses a trimmed env override', () => {
    process.env.LINKEDIN_OAUTH_SCOPES = '  w_member_social openid  '
    expect(getLinkedInOAuthScopes()).toBe('w_member_social openid')
  })
})
