import { cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const clarityInit = vi.fn()

vi.mock('@microsoft/clarity', () => ({
  default: { init: (...args: unknown[]) => clarityInit(...args) },
}))

import { ClarityComponent } from './Clarity'

const originalProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID

afterEach(() => {
  cleanup()
  clarityInit.mockReset()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  if (originalProjectId === undefined) {
    delete process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID
  } else {
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = originalProjectId
  }
})

describe('ClarityComponent', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'requestIdleCallback',
      (callback: () => void) => {
        callback()
        return 1
      },
    )
    vi.stubGlobal('cancelIdleCallback', vi.fn())
  })

  it('does not initialize the placeholder or empty project id', async () => {
    delete process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID
    render(<ClarityComponent />)
    await Promise.resolve()
    expect(clarityInit).not.toHaveBeenCalled()

    cleanup()
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = 'yourProjectId'
    render(<ClarityComponent />)
    await Promise.resolve()
    expect(clarityInit).not.toHaveBeenCalled()
  })

  it('initializes a real project id from the idle callback', async () => {
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = 'clarity-123'
    render(<ClarityComponent />)

    await waitFor(() => {
      expect(clarityInit).toHaveBeenCalledWith('clarity-123')
    })
  })

  it('cancels a pending idle init on unmount', () => {
    const cancelIdleCallback = vi.fn()
    vi.stubGlobal('requestIdleCallback', () => 42)
    vi.stubGlobal('cancelIdleCallback', cancelIdleCallback)
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = 'clarity-123'

    const { unmount } = render(<ClarityComponent />)
    unmount()

    expect(clarityInit).not.toHaveBeenCalled()
    expect(cancelIdleCallback).toHaveBeenCalledWith(42)
  })

  it('falls back to a timeout and clears it on unmount', () => {
    vi.useFakeTimers()
    vi.stubGlobal('requestIdleCallback', undefined)
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = 'clarity-123'

    const { unmount } = render(<ClarityComponent />)
    unmount()
    vi.runAllTimers()

    expect(clarityInit).not.toHaveBeenCalled()
    vi.useRealTimers()
  })
})
