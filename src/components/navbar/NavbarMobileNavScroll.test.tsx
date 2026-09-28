import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { NAV_USER } from './navConfig'
import { NavbarMobileNavScroll } from './NavbarMobileNavScroll'

vi.mock('next/link', () => ({
  default: function NextLink({
    href,
    children,
    className,
    onClick,
  }: {
    href: string
    children: ReactNode
    className?: string
    onClick?: () => void
  }) {
    return (
      <a
        href={href}
        className={className}
        onClick={(event) => {
          event.preventDefault()
          onClick?.()
        }}
      >
        {children}
      </a>
    )
  },
}))

afterEach(() => {
  cleanup()
})

describe('NavbarMobileNavScroll', () => {
  it('hides account links unless the account section is shown', () => {
    const { rerender } = render(
      <NavbarMobileNavScroll
        pathname="/students/ada"
        onClose={vi.fn()}
        userLinks={NAV_USER}
        showAccount={false}
      />,
    )

    expect(screen.queryByText('Account')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Administration' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Hire Talent' })).toHaveAttribute(
      'href',
      '/students',
    )

    const students = screen.getByRole('link', { name: 'Students' })
    expect(students.className).toContain('font-semibold')
    expect(screen.getByRole('link', { name: 'Home' }).className).not.toContain(
      'font-semibold',
    )

    rerender(
      <NavbarMobileNavScroll
        pathname="/"
        onClose={vi.fn()}
        userLinks={NAV_USER}
        showAccount
      />,
    )
    expect(screen.getByRole('link', { name: 'Administration' })).toHaveAttribute(
      'href',
      '/secured/admin',
    )
    expect(screen.getByRole('link', { name: 'Home' }).className).toContain('font-semibold')
  })

  it('closes the panel when a nav link is chosen', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <NavbarMobileNavScroll
        pathname="/"
        onClose={onClose}
        userLinks={[]}
        showAccount={false}
      />,
    )

    await user.click(screen.getByRole('link', { name: 'Events' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
