import { describe, expect, it } from 'vitest'

import {
  MEDIUM_USERNAME_TAKEN_MESSAGE,
  ProfileSaveError,
  classifyProfileSaveFailure,
  toProfileSaveError,
} from '@/lib/profileSaveError'

const mediumUsernameConflict = {
  code: '23505',
  details: null,
  hint: null,
  message:
    'duplicate key value violates unique constraint "students_medium_username_key"',
}

describe('classifyProfileSaveFailure', () => {
  it('turns a medium username conflict into a field error and skips reporting', () => {
    const failure = classifyProfileSaveFailure(mediumUsernameConflict)

    expect(failure.shouldReport).toBe(false)
    expect(failure.field).toBe('mediumUsername')
    expect(failure.message).toBe(MEDIUM_USERNAME_TAKEN_MESSAGE)
    expect(failure.message).not.toMatch(/duplicate key/i)
    expect(failure.error).toBeInstanceOf(ProfileSaveError)
  })

  it('does not echo the conflicting username from postgres details', () => {
    const failure = classifyProfileSaveFailure({
      code: '23505',
      details: 'Key (medium_username)=(taken-name) already exists.',
      hint: null,
      message: mediumUsernameConflict.message,
    })

    expect(failure.shouldReport).toBe(false)
    expect(failure.message).not.toContain('taken-name')
  })

  it('still reports other unique violations', () => {
    const raw = {
      code: '23505',
      details: null,
      hint: null,
      message: 'duplicate key value violates unique constraint "students_pkey"',
    }
    const failure = classifyProfileSaveFailure(raw)

    expect(failure.shouldReport).toBe(true)
    expect(failure.field).toBeUndefined()
    expect(failure.error).toBe(raw)
    expect(failure.message).toBe(raw.message)
  })

  it('still reports permission and plain Error failures', () => {
    const permission = {
      code: '42501',
      details: null,
      hint: null,
      message: 'new row violates row-level security',
    }
    expect(classifyProfileSaveFailure(permission)).toMatchObject({
      shouldReport: true,
      error: permission,
      message: permission.message,
    })

    const thrown = new Error('permission denied')
    expect(classifyProfileSaveFailure(thrown)).toMatchObject({
      shouldReport: true,
      error: thrown,
      message: 'permission denied',
    })
  })

  it('maps the same conflict only once', () => {
    const once = toProfileSaveError(mediumUsernameConflict)
    expect(toProfileSaveError(once)).toBe(once)
  })
})
