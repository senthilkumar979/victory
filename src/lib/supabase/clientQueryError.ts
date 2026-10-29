/**
 * PostgREST turns a failed `fetch` into a plain `{ code, details, hint, message }`
 * object. `Sentry.captureException` on that object is grouped as
 * "Object captured as exception" and titled from the minified caller.
 */

export const PROFILE_SAVE_NETWORK_MESSAGE =
  'We could not reach the server. Check your connection and try again.'

const TRANSIENT_FETCH_MESSAGE =
  /^(?:(?:TypeError|FetchError):\s*)?(?:Failed to fetch|Load failed|NetworkError when attempting to fetch resource\.)(?:\s*\([^)]*\))?$/i

interface QueryErrorShape {
  message?: unknown
  code?: unknown
}

export function readSupabaseErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message
  if (typeof error === 'string' && error.trim()) return error
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as QueryErrorShape).message
    if (typeof message === 'string' && message.trim()) return message
  }
  return 'Please try again.'
}

export function readSupabaseErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object' || !('code' in error)) return undefined
  const code = (error as QueryErrorShape).code
  if (typeof code !== 'string' || !code.trim()) return undefined
  return code
}

export function isTransientFetchFailure(error: unknown): boolean {
  return TRANSIENT_FETCH_MESSAGE.test(readSupabaseErrorMessage(error).trim())
}

export function toThrownQueryError(error: unknown): Error {
  if (error instanceof Error) return error
  const wrapped = new Error(readSupabaseErrorMessage(error))
  wrapped.name = 'SupabaseRequestError'
  return wrapped
}

export function profileSaveFailure(error: unknown): {
  shouldReport: boolean
  message: string
} {
  if (isTransientFetchFailure(error)) {
    return { shouldReport: false, message: PROFILE_SAVE_NETWORK_MESSAGE }
  }
  return { shouldReport: true, message: readSupabaseErrorMessage(error) }
}
