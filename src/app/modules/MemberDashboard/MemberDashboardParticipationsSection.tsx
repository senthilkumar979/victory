'use client'

import type { MeetingFormState } from '@/app/modules/Meetings/Meeting.types'
import { formatDate } from '@/utils/meetingUtils'
import { motion } from 'framer-motion'
import { ExternalLink, UserCheck } from 'lucide-react'
import Link from 'next/link'

interface MemberDashboardParticipationsSectionProps {
  participations: MeetingFormState[]
  isLoading: boolean
  error: string | null
}

const MAX = 5

export const MemberDashboardParticipationsSection = ({
  participations,
  isLoading,
  error,
}: MemberDashboardParticipationsSectionProps) => {
  const list = participations.slice(0, MAX)

  return (
    <section
      className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm"
      aria-labelledby="member-dashboard-participations-heading"
    >
      <div className="mb-4 flex items-center gap-2">
        <UserCheck className="size-5 text-primary" aria-hidden />
        <h2
          id="member-dashboard-participations-heading"
          className="text-lg font-semibold text-slate-900"
        >
          Your sessions
        </h2>
      </div>
      <p className="mb-4 text-sm text-slate-500">
        Meetings where you are marked as attended.
      </p>

      {isLoading && (
        <ul className="space-y-3">
          {[1, 2].map((i) => (
            <li
              key={i}
              className="h-14 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </ul>
      )}

      {error && !isLoading ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {!isLoading && !error && list.length === 0 ? (
        <p className="text-sm text-slate-500">
          No recorded participations yet. Join a session and ask an admin to
          mark your attendance.
        </p>
      ) : null}

      {!isLoading && !error && list.length > 0 ? (
        <ul className="space-y-3">
          {list.map((m, i) => (
            <motion.li
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-900">{m.title}</p>
                <p className="text-sm text-slate-500">
                  {formatDate(m.date)} · IST
                </p>
              </div>
              {m.meetingLink?.trim() ? (
                <Link
                  href={m.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Open link
                  <ExternalLink className="size-3.5" aria-hidden />
                </Link>
              ) : null}
            </motion.li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
