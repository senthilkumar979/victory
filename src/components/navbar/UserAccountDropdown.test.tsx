import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { UserAccountDropdown } from './UserAccountDropdown'
import type { NavUserItem } from './navConfig'

vi.mock('next/link', () => ({
  default: function NextLink({
    children,
    href,
    onClick,
    ...props
  }: {
    children?: ReactNode
    href: string
    onClick?: (event: { preventDefault: () => void }) => void
  }) {
    return (
      <a
        href={href}
        {...props}
        onClick={(event) => {
          event.preventDefault()
          onClick?.(event)
        }}
      >
        {children}
      </a>
    )
  },
}))

vi.mock('@clerk/nextjs', () => ({
  SignOutButton: function SignOutButton({
    children,
    signOutOptions,
  }: {
    children: ReactNode
    signOutOptions?: { redirectUrl?: string }
  }) {
    return <div data-redirect={signOutOptions?.redirectUrl}>{children}</div>
  },
  UserButton: function UserButton() {
    return null
  },
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: function MotionDiv({
      children,
      ...props
    }: { children?: ReactNode } & Record<string, unknown>) {
      const rest = { ...props }
      for (const key of ['initial', 'animate', 'exit', 'transition']) {
        delete rest[key]
      }
      return <div {...rest}>{children}</div>
    },
  },
}))

const Icon = () => <svg aria-hidden />

const links: NavUserItem[] = [
  { href: '/secured/dashboard', label: 'Dashboard', icon: Icon },
  { href: '/secured/admin', label: 'Administration', icon: Icon },
]

afterEach(() => {
  cleanup()
})

describe('UserAccountDropdown', () => {
  it('lists account links and signs out to the site root', () => {
    render(
      <UserAccountDropdown
        menuId="account-menu"
        links={links}
        onClose={vi.fn()}
        reduceMotion
      />,
    )

    const menu = screen.getByRole('menu', { name: 'Account' })
    expect(menu).toHaveAttribute('id', 'account-menu')
    expect(screen.getByRole('menuitem', { name: 'Dashboard' })).toHaveAttribute(
      'href',
      '/secured/dashboard',
    )
    expect(
      screen.getByRole('menuitem', { name: 'Administration' }),
    ).toHaveAttribute('href', '/secured/admin')
    expect(screen.getByRole('menuitem', { name: 'Logout' }).closest('div')).toHaveAttribute(
      'data-redirect',
      '/',
    )
  })

  it('closes the menu from a link and from logout', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <UserAccountDropdown
        menuId="account-menu"
        links={links}
        onClose={onClose}
        reduceMotion={false}
      />,
    )

    await user.click(screen.getByRole('menuitem', { name: 'Dashboard' }))
    await user.click(screen.getByRole('menuitem', { name: 'Logout' }))

    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('still offers logout when the caller passes no links', () => {
    render(
      <UserAccountDropdown
        menuId="account-menu"
        links={[]}
        onClose={vi.fn()}
        reduceMotion
      />,
    )

    expect(screen.getAllByRole('menuitem')).toHaveLength(1)
    expect(screen.getByRole('menuitem', { name: 'Logout' })).toBeInTheDocument()
  })
})
