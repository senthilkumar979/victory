import { describe, expect, it } from 'vitest'

import { cefSharpObjectNotFoundErrorPattern } from './config'

describe('cefSharpObjectNotFoundErrorPattern', () => {
  it('matches CefSharp object repository rejection variants', () => {
    expect(
      cefSharpObjectNotFoundErrorPattern.test(
        'Non-Error promise rejection captured with value: Object Not Found Matching Id:3, MethodName:update, ParamCount:4',
      ),
    ).toBe(true)
    expect(
      cefSharpObjectNotFoundErrorPattern.test(
        'Object Not Found Matching Id:42, MethodName:update, ParamCount:4',
      ),
    ).toBe(true)
  })

  it('does not suppress unrelated application errors', () => {
    expect(
      cefSharpObjectNotFoundErrorPattern.test(
        'Object Not Found Matching Id:3, MethodName:delete, ParamCount:4',
      ),
    ).toBe(false)
    expect(
      cefSharpObjectNotFoundErrorPattern.test('Failed to update student'),
    ).toBe(false)
  })
})
