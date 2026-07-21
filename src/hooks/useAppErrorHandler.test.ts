import { beforeEach, describe, expect, it, vi } from 'vitest'

import { handleAppError } from './useAppErrorHandler'

const { isUnrecognizedActionErrorMock } = vi.hoisted(() => ({
  isUnrecognizedActionErrorMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  unstable_isUnrecognizedActionError: isUnrecognizedActionErrorMock,
}))

describe('handleAppError', () => {
  const handlers = {
    reload: vi.fn(),
    report: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reloads instead of reporting a stale Server Action error', () => {
    const error = new Error('Synthetic stale action')
    isUnrecognizedActionErrorMock.mockReturnValue(true)

    handleAppError(error, handlers)

    expect(handlers.reload).toHaveBeenCalledTimes(1)
    expect(handlers.report).not.toHaveBeenCalled()
  })

  it('reports errors that are unrelated to deployment skew', () => {
    const error = new Error('Synthetic application error')
    isUnrecognizedActionErrorMock.mockReturnValue(false)

    handleAppError(error, handlers)

    expect(handlers.reload).not.toHaveBeenCalled()
    expect(handlers.report).toHaveBeenCalledWith(error)
  })
})
