import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MemberDashboardQuickLinks } from './MemberDashboardQuickLinks'

vi.mock('framer-motion', () => ({
  motion: {
    li: 'li',
  },
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

afterEach(() => {
  cleanup()
})

const allowedHrefs = [
  '/secured/assignments',
  '/secured/videos',
  '/students',
  '/events',
  '/roadmaps',
  '/blogs',
]

const excludedLabels = [
  'Home',
  'Products',
  'Hall of Fame',
  'Gallery',
  'Dashboard',
  'Profile',
  'Administration',
  'Account',
  'Interview Prep',
]

describe('MemberDashboardQuickLinks', () => {
  it('renders only allowlisted member destinations from nav config', () => {
    render(<MemberDashboardQuickLinks />)

    const links = screen.getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual(allowedHrefs)
    expect(screen.getByRole('link', { name: 'Assignments' })).toHaveAttribute(
      'href',
      '/secured/assignments',
    )
    expect(screen.getByRole('link', { name: 'Videos' })).toHaveAttribute(
      'href',
      '/secured/videos',
    )
  })

  it('omits admin, account, and unlisted marketing destinations', () => {
    render(<MemberDashboardQuickLinks />)

    for (const label of excludedLabels) {
      expect(screen.queryByRole('link', { name: label })).not.toBeInTheDocument()
    }
    expect(screen.queryByRole('link', { name: /interview-prep/i })).not.toBeInTheDocument()
  })
})
