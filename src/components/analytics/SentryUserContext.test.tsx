import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SentryUserContext } from './SentryUserContext'

interface ClerkUser {
  id: string
  username: string | null
  primaryEmailAddress: { emailAddress: string } | null
}

const { setUser, sentryState, userState } = vi.hoisted(() => ({
  setUser: vi.fn(),
  sentryState: { enabled: true },
  userState: {
    isLoaded: false,
    user: null as ClerkUser | null,
  },
}))

vi.mock('@sentry/nextjs', () => ({
  setUser,
}))

vi.mock('@/lib/sentry/config', () => ({
  get isSentryEnabled() {
    return sentryState.enabled
  },
}))

vi.mock('@clerk/nextjs', () => ({
  useUser: () => userState,
}))

describe('SentryUserContext', () => {
  beforeEach(() => {
    setUser.mockReset()
    sentryState.enabled = true
    userState.isLoaded = false
    userState.user = null
  })

  afterEach(() => {
    cleanup()
  })

  it('does not set a Sentry user before Clerk loads or when reporting is disabled', () => {
    userState.user = {
      id: 'user_1',
      username: 'ada',
      primaryEmailAddress: { emailAddress: 'ada@example.com' },
    }

    const { rerender } = render(<SentryUserContext />)
    expect(setUser).not.toHaveBeenCalled()

    sentryState.enabled = false
    userState.isLoaded = true
    rerender(<SentryUserContext />)

    expect(setUser).not.toHaveBeenCalled()
  })

  it('tags the signed-in member and clears the user after sign-out', () => {
    userState.isLoaded = true
    userState.user = {
      id: 'user_1',
      username: null,
      primaryEmailAddress: null,
    }

    const { rerender } = render(<SentryUserContext />)

    expect(setUser).toHaveBeenCalledWith({
      id: 'user_1',
      email: undefined,
      username: undefined,
    })

    userState.user = {
      id: 'user_2',
      username: 'ada',
      primaryEmailAddress: { emailAddress: 'ada@example.com' },
    }
    rerender(<SentryUserContext />)
    userState.user = null
    rerender(<SentryUserContext />)

    expect(setUser).toHaveBeenNthCalledWith(2, {
      id: 'user_2',
      email: 'ada@example.com',
      username: 'ada',
    })
    expect(setUser).toHaveBeenLastCalledWith(null)
  })
})
