import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { UserMenu } from './UserMenu'

const { useUserMock, useIsAdminMock } = vi.hoisted(() => ({
  useUserMock: vi.fn(),
  useIsAdminMock: vi.fn(),
}))

vi.mock('@clerk/nextjs', () => ({
  useUser: () => useUserMock(),
  SignInButton: ({ children }: { children: ReactNode }) => (
    <div data-testid="sign-in-button">{children}</div>
  ),
}))

vi.mock('@/hooks/useIsAdmin', () => ({
  useIsAdmin: () => useIsAdminMock(),
}))

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span data-alt={alt} />,
}))

vi.mock('framer-motion', () => {
  const Button = ({
    children,
    ...props
  }: {
    children?: ReactNode
  } & Record<string, unknown>) => {
    const rest = { ...props }
    delete rest.whileHover
    delete rest.whileTap
    return <button {...rest}>{children}</button>
  }
  return {
    motion: { button: Button },
    AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
    useReducedMotion: () => true,
  }
})

vi.mock('./UserAccountDropdown', () => ({
  UserAccountDropdown: ({
    links,
  }: {
    links: { href: string; label: string }[]
  }) => (
    <div role="menu">
      {links.map((link) => (
        <a key={link.href} href={link.href}>
          {link.label}
        </a>
      ))}
    </div>
  ),
}))

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('UserMenu', () => {
  beforeEach(() => {
    useIsAdminMock.mockReturnValue(false)
  })

  it('keeps a pulse until Clerk loads, then falls back to /sign-in after 4s', () => {
    vi.useFakeTimers()
    useUserMock.mockReturnValue({ user: null, isLoaded: false })

    render(<UserMenu />)

    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument()
    expect(screen.queryByTestId('sign-in-button')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(3999)
    })
    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute(
      'href',
      '/sign-in',
    )
  })

  it('uses the modal login once Clerk finishes loading without a user', () => {
    vi.useFakeTimers()
    useUserMock.mockReturnValue({ user: null, isLoaded: false })

    const { rerender } = render(<UserMenu />)
    useUserMock.mockReturnValue({ user: null, isLoaded: true })
    rerender(<UserMenu />)

    act(() => {
      vi.advanceTimersByTime(4000)
    })

    expect(screen.getByTestId('sign-in-button')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument()
  })

  it('opens the account menu for signed-in members and hides admin links', async () => {
    const user = userEvent.setup()
    useUserMock.mockReturnValue({
      isLoaded: true,
      user: {
        firstName: 'Ada',
        imageUrl: '',
        emailAddresses: [{ emailAddress: 'ada@example.com' }],
      },
    })

    render(<UserMenu />)

    await user.click(screen.getByRole('button', { name: 'Open account menu' }))

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Administration' }),
    ).not.toBeInTheDocument()
  })
})
