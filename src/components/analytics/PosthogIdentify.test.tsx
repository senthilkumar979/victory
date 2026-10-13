import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PosthogIdentify } from './PosthogIdentify'

interface ClerkUser {
  id: string
  fullName: string | null
  username: string | null
  primaryEmailAddress: { emailAddress: string } | null
}

const { identify, reset, userState } = vi.hoisted(() => ({
  identify: vi.fn(),
  reset: vi.fn(),
  userState: {
    isLoaded: false,
    user: null as ClerkUser | null,
  },
}))

vi.mock('@clerk/nextjs', () => ({
  useUser: () => userState,
}))

vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({ identify, reset }),
}))

const signedInUser: ClerkUser = {
  id: 'user_1',
  fullName: 'Ada Lovelace',
  username: 'ada',
  primaryEmailAddress: { emailAddress: 'ada@example.com' },
}

describe('PosthogIdentify', () => {
  beforeEach(() => {
    identify.mockReset()
    reset.mockReset()
    userState.isLoaded = false
    userState.user = null
  })

  afterEach(() => {
    cleanup()
  })

  it('does not identify or reset before Clerk finishes loading', () => {
    userState.user = signedInUser

    render(<PosthogIdentify />)

    expect(identify).not.toHaveBeenCalled()
    expect(reset).not.toHaveBeenCalled()
  })

  it('identifies a signed-in member once and skips a repeat of the same id', () => {
    userState.isLoaded = true
    userState.user = signedInUser

    const { rerender } = render(<PosthogIdentify />)
    userState.user = { ...signedInUser }
    rerender(<PosthogIdentify />)

    expect(identify).toHaveBeenCalledTimes(1)
    expect(identify).toHaveBeenCalledWith('user_1', {
      email: 'ada@example.com',
      name: 'Ada Lovelace',
      username: 'ada',
    })
    expect(reset).not.toHaveBeenCalled()
  })

  it('omits missing profile fields and identifies a different user', () => {
    userState.isLoaded = true
    userState.user = {
      id: 'user_1',
      fullName: null,
      username: null,
      primaryEmailAddress: null,
    }

    const { rerender } = render(<PosthogIdentify />)

    expect(identify).toHaveBeenCalledWith('user_1', {
      email: undefined,
      name: undefined,
      username: undefined,
    })

    userState.user = { ...signedInUser, id: 'user_2' }
    rerender(<PosthogIdentify />)

    expect(identify).toHaveBeenLastCalledWith('user_2', {
      email: 'ada@example.com',
      name: 'Ada Lovelace',
      username: 'ada',
    })
    expect(reset).not.toHaveBeenCalled()
  })

  it('resets only after a previous identify, not for a visitor who never signed in', () => {
    userState.isLoaded = true

    const { rerender } = render(<PosthogIdentify />)

    expect(reset).not.toHaveBeenCalled()

    userState.user = signedInUser
    rerender(<PosthogIdentify />)
    userState.user = null
    rerender(<PosthogIdentify />)
    rerender(<PosthogIdentify />)

    expect(reset).toHaveBeenCalledTimes(1)
  })
})
