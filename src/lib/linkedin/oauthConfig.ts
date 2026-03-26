/** Must match an Authorized redirect URL in the LinkedIn app (exact string). */
export function getLinkedInRedirectUri(): string {
  const fromEnv = process.env.LINKEDIN_REDIRECT_URI?.trim()
  if (fromEnv) return fromEnv
  return 'http://localhost:3000/api/linkedin/oauth/callback'
}

/** Space-separated scopes (LinkedIn OAuth). Override via LINKEDIN_OAUTH_SCOPES if needed. */
export function getLinkedInOAuthScopes(): string {
  const fromEnv = process.env.LINKEDIN_OAUTH_SCOPES?.trim()
  if (fromEnv) return fromEnv
  return 'w_organization_social'
}
