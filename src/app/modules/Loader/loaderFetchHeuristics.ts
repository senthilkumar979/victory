const STATIC_ASSET_REGEX = /\.(png|jpe?g|gif|svg|ico|css|js|woff2?|ttf|eot)(\?.*)?$/i

/** Fetch targets that should not trigger the full-page overlay (inline UI handles loading). */
export function isExcludedFromGlobalLoader(url: string): boolean {
  try {
    const raw =
      url.startsWith('http://') || url.startsWith('https://')
        ? new URL(url).pathname
        : url.split('?')[0]?.split('#')[0] ?? ''
    const path = raw.replace(/\/$/, '') || '/'
    return path === '/api/visitor-chat'
  } catch {
    return false
  }
}

export function pathnameOnly(url: string): string {
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return new URL(url).pathname
    }
    return url.split('?')[0]?.split('#')[0] ?? ''
  } catch {
    return ''
  }
}

/**
 * Only real data fetches should dim the UI - not Next.js RSC/flight requests,
 * same-origin navigations, or arbitrary `/path` fetches (those wreck mobile INP).
 */
export function shouldShowLoaderForUrl(url: string): boolean {
  try {
    const parsed = typeof url === 'string' ? url : ''
    if (!parsed) return false
    if (STATIC_ASSET_REGEX.test(parsed)) return false
    if (isExcludedFromGlobalLoader(parsed)) return false
    if (parsed.includes('supabase')) return true
    const path = pathnameOnly(parsed)
    if (path.startsWith('/api')) return true
  } catch {
    return false
  }
  return false
}
