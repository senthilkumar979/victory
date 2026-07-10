'use client'

import type { ProfileData } from '@/types/student.types'

interface MemberDashboardHeaderProps {
  displayName: string
  profile: ProfileData | null
  isAdmin?: boolean
}

export const MemberDashboardHeader = ({
  displayName,
  profile,
  isAdmin = false,
}: MemberDashboardHeaderProps) => {
  const name = profile?.name?.trim() || displayName
  return (
    <header className="mb-8">
      <p className="text-sm font-medium uppercase tracking-widest text-primary">
        {isAdmin ? 'Admin home' : 'Member home'}
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
        Welcome back, {name}
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        {isAdmin
          ? 'Overview of announcements, session videos, and this week’s schedule.'
          : 'Here is your week at a glance, latest announcements, and shortcuts to keep learning.'}
      </p>
    </header>
  )
}
