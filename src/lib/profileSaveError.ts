export const MEDIUM_USERNAME_TAKEN_MESSAGE =
  'That Medium username is already used by another profile. Choose a different username.'

const UNIQUE_VIOLATION = '23505'
const MEDIUM_USERNAME_CONSTRAINT = 'students_medium_username_key'

export class ProfileSaveError extends Error {
  readonly isExpected: boolean
  readonly field?: 'mediumUsername'

  constructor(message: string, field?: 'mediumUsername') {
    super(message)
    this.name = 'ProfileSaveError'
    this.isExpected = true
    this.field = field
  }
}

interface QueryErrorShape {
  code?: unknown
  message?: unknown
  details?: unknown
  hint?: unknown
}

export interface ProfileSaveFailure {
  error: unknown
  shouldReport: boolean
  message: string
  field?: 'mediumUsername'
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function isQueryError(error: unknown): error is QueryErrorShape {
  if (!error || typeof error !== 'object' || error instanceof Error) return false
  return 'message' in error && ('code' in error || 'details' in error || 'hint' in error)
}

function isMediumUsernameConflict(error: unknown): boolean {
  if (!isQueryError(error) || readString(error.code) !== UNIQUE_VIOLATION) return false
  const text = `${readString(error.message)}\n${readString(error.details)}`
  return (
    text.includes(MEDIUM_USERNAME_CONSTRAINT) || text.includes('(medium_username)')
  )
}

function thrownMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message
  if (typeof error === 'string' && error.trim()) return error
  if (isQueryError(error)) {
    const message = readString(error.message).trim()
    if (message) return message
  }
  return 'Please try again.'
}

export function toProfileSaveError(error: unknown): unknown {
  if (error instanceof ProfileSaveError) return error
  if (!isMediumUsernameConflict(error)) return error
  return new ProfileSaveError(MEDIUM_USERNAME_TAKEN_MESSAGE, 'mediumUsername')
}

export function classifyProfileSaveFailure(error: unknown): ProfileSaveFailure {
  const mapped = toProfileSaveError(error)
  if (mapped instanceof ProfileSaveError) {
    return {
      error: mapped,
      shouldReport: !mapped.isExpected,
      message: mapped.message,
      field: mapped.field,
    }
  }
  return {
    error,
    shouldReport: true,
    message: thrownMessage(error),
  }
}
