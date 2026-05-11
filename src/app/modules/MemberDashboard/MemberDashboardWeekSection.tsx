'use client'

import { CurrentWeekCard } from '@/app/modules/Meetings/CurrentWeekCard'

export const MemberDashboardWeekSection = () => (
  <section
    className="mt-8"
    aria-labelledby="member-dashboard-week-heading"
  >
    <h2
      id="member-dashboard-week-heading"
      className="mb-4 text-lg font-semibold text-slate-900"
    >
      This week
    </h2>
    <CurrentWeekCard enableAutoRotate={false} />
  </section>
)
