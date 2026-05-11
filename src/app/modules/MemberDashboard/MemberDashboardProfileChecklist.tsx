'use client'

import type { ProfileChecklistItem } from '@/lib/studentProfileCompleteness'
import { Check, Circle } from 'lucide-react'
import Link from 'next/link'

interface MemberDashboardProfileChecklistProps {
  items: ProfileChecklistItem[]
}

export const MemberDashboardProfileChecklist = ({
  items,
}: MemberDashboardProfileChecklistProps) => {
  const incomplete = items.filter((x) => !x.done).length

  return (
    <section
      className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm"
      aria-labelledby="member-dashboard-checklist-heading"
    >
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <h2
          id="member-dashboard-checklist-heading"
          className="text-lg font-semibold text-slate-900"
        >
          Profile checklist
        </h2>
        {incomplete > 0 ? (
          <span className="text-xs font-medium text-amber-700">
            {incomplete} to improve
          </span>
        ) : (
          <span className="text-xs font-medium text-emerald-700">All set</span>
        )}
      </div>
      <p className="mb-4 text-sm text-slate-500">
        A stronger profile helps mentors and peers know you better.
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-2 text-sm text-slate-700"
          >
            {item.done ? (
              <Check
                className="size-4 shrink-0 text-emerald-600"
                aria-label="Done"
              />
            ) : (
              <Circle
                className="size-4 shrink-0 text-slate-300"
                aria-label="Not done"
              />
            )}
            <span className={item.done ? 'text-slate-500 line-through' : ''}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
      <Link
        href="/secured/profile"
        className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
      >
        Edit profile
      </Link>
    </section>
  )
}
