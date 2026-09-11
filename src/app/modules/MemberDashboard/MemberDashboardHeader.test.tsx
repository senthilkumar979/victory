import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import type { ProfileData } from '@/types/student.types'

import { MemberDashboardHeader } from './MemberDashboardHeader'

afterEach(() => {
  cleanup()
})

function makeProfile(overrides: Partial<ProfileData> = {}): ProfileData {
  return {
    id: 'stu-1',
    name: 'Ada Lovelace',
    email: 'ada@test.com',
    picture: '',
    role: 'Engineer',
    batch: '9',
    serialNo: 1,
    ...overrides,
  } as ProfileData
}

describe('MemberDashboardHeader', () => {
  it('prefers a trimmed profile name and uses member copy by default', () => {
    render(
      <MemberDashboardHeader
        displayName="Clerk Name"
        profile={makeProfile({ name: '  Ada  ' })}
      />,
    )

    expect(screen.getByText('Member home')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Welcome back, Ada',
    )
    expect(
      screen.getByText(/week at a glance, latest announcements/),
    ).toBeInTheDocument()
  })

  it('falls back to displayName and switches copy for admins', () => {
    render(
      <MemberDashboardHeader
        displayName="Admin User"
        profile={makeProfile({ name: '   ' })}
        isAdmin
      />,
    )

    expect(screen.getByText('Admin home')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Welcome back, Admin User',
    )
    expect(
      screen.getByText(/Overview of announcements, session videos/),
    ).toBeInTheDocument()
  })
})
