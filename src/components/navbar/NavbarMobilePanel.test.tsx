import { act, cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { NavbarMobilePanel } from './NavbarMobilePanel'

const { useUserMock, useIsAdminMock } = vi.hoisted(() => ({
  useUserMock: vi.fn(),
  useIsAdminMock: vi.fn(),
}))

vi.mock('@clerk/nextjs', () => ({
  useUser: () => useUserMock(),
  SignInButton: ({ children }: { children: ReactNode }) => (
    <div data-testid="sign-in-button">{children}</div>
  ),
  SignOutButton: ({ children }: { children: ReactNode }) => (
    <div data-testid="sign-out-button">{children}</div>
  ),
}))

vi.mock('@/hooks/useIsAdmin', () => ({
  useIsAdmin: () => useIsAdminMock(),
}))

vi.mock('framer-motion', () => {
  const PassThrough = ({
    children,
    ...props
  }: {
    children?: ReactNode
  } & Record<string, unknown>) => {
    const rest = { ...props }
    delete rest.initial
    delete rest.animate
    delete rest.exit
    delete rest.transition
    return <div {...rest}>{children}</div>
  }
  return {
    motion: { div: PassThrough, aside: PassThrough },
  }
})

vi.mock('./NavbarMobileNavScroll', () => ({
  NavbarMobileNavScroll: ({ showAccount }: { showAccount: boolean }) => (
    <div data-testid="mobile-nav" data-show-account={String(showAccount)} />
  ),
}))

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('NavbarMobilePanel', () => {
  beforeEach(() => {
    useIsAdminMock.mockReturnValue(false)
  })

  it('shows a /sign-in fallback after Clerk stays unloaded for 4s', () => {
    vi.useFakeTimers()
    useUserMock.mockReturnValue({ user: null, isLoaded: false })

    render(<NavbarMobilePanel pathname="/" onClose={vi.fn()} />)

    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument()
    expect(screen.getByTestId('mobile-nav')).toHaveAttribute(
      'data-show-account',
      'false',
    )

    act(() => {
      vi.advanceTimersByTime(4000)
    })

    expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute(
      'href',
      '/sign-in',
    )
  })

  it('uses modal login once loaded without a user and logout once signed in', () => {
    vi.useFakeTimers()
    useUserMock.mockReturnValue({ user: null, isLoaded: false })

    const { rerender } = render(
      <NavbarMobilePanel pathname="/" onClose={vi.fn()} />,
    )
    useUserMock.mockReturnValue({ user: null, isLoaded: true })
    rerender(<NavbarMobilePanel pathname="/" onClose={vi.fn()} />)

    act(() => {
      vi.advanceTimersByTime(4000)
    })

    expect(screen.getByTestId('sign-in-button')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument()

    useUserMock.mockReturnValue({
      isLoaded: true,
      user: { firstName: 'Ada' },
    })
    rerender(<NavbarMobilePanel pathname="/" onClose={vi.fn()} />)

    expect(screen.getByTestId('sign-out-button')).toBeInTheDocument()
    expect(screen.getByTestId('mobile-nav')).toHaveAttribute(
      'data-show-account',
      'true',
    )
    expect(screen.queryByTestId('sign-in-button')).not.toBeInTheDocument()
  })
})
