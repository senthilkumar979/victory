import { describe, expect, it } from 'vitest'

import {
  PROFILE_SAVE_NETWORK_MESSAGE,
  isTransientFetchFailure,
  profileSaveFailure,
  readSupabaseErrorCode,
  toThrownQueryError,
} from './clientQueryError'

const fetchFailure = {
  code: '',
  details: 'TypeError: Failed to fetch\n    at https://example.test/chunk.js:1:1',
  hint: '',
  message: 'TypeError: Failed to fetch (db.example.test)',
}

describe('clientQueryError', () => {
  it('treats a PostgREST fetch failure object as transient and not reportable', () => {
    expect(isTransientFetchFailure(fetchFailure)).toBe(true)
    expect(profileSaveFailure(fetchFailure)).toEqual({
      shouldReport: false,
      message: PROFILE_SAVE_NETWORK_MESSAGE,
    })
    expect(readSupabaseErrorCode(fetchFailure)).toBeUndefined()
  })

  it('wraps the plain fetch failure as an Error whose message is not the stack', () => {
    const error = toThrownQueryError(fetchFailure)

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('SupabaseRequestError')
    expect(error.message).toBe('TypeError: Failed to fetch (db.example.test)')
    expect(error.message).not.toContain('chunk.js')
    expect(profileSaveFailure(error).shouldReport).toBe(false)
  })

  it('still reports database errors and preserves their message', () => {
    const denied = {
      code: '42501',
      details: 'RLS denied the update',
      hint: '',
      message: 'permission denied for table students',
    }

    const failure = profileSaveFailure(denied)
    const error = toThrownQueryError(denied)

    expect(failure).toEqual({
      shouldReport: true,
      message: 'permission denied for table students',
    })
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('permission denied for table students')
    expect(readSupabaseErrorCode(denied)).toBe('42501')
  })

  it('recognizes Safari and Firefox fetch failures', () => {
    expect(isTransientFetchFailure(new TypeError('Load failed'))).toBe(true)
    expect(
      isTransientFetchFailure({
        message: 'TypeError: NetworkError when attempting to fetch resource. (db.example.test)',
      }),
    ).toBe(true)
  })

  it('leaves an existing Error unchanged', () => {
    const original = new Error('No rows were updated.')
    expect(toThrownQueryError(original)).toBe(original)
    expect(profileSaveFailure(original).shouldReport).toBe(true)
  })
})
