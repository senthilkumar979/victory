import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useCheckIsAuthenticated } from './useCheckIsAuthenticated'

const { useAuthMock, redirectMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  redirectMock: vi.fn(),
}))

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => useAuthMock(),
}))

vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => redirectMock(...args),
}))

afterEach(() => {
  cleanup()
})

describe('useCheckIsAuthenticated', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not redirect while Clerk auth is still loading', () => {
    useAuthMock.mockReturnValue({ isLoaded: false, isSignedIn: false })

    renderHook(() => useCheckIsAuthenticated())

    expect(redirectMock).not.toHaveBeenCalled()
  })

  it('redirects unsigned-in users to sign-in after auth loads', () => {
    useAuthMock.mockReturnValue({ isLoaded: true, isSignedIn: false })

    renderHook(() => useCheckIsAuthenticated())

    expect(redirectMock).toHaveBeenCalledWith('/sign-in')
  })

  it('leaves signed-in users on the current page', () => {
    useAuthMock.mockReturnValue({ isLoaded: true, isSignedIn: true })

    renderHook(() => useCheckIsAuthenticated())

    expect(redirectMock).not.toHaveBeenCalled()
  })
})
