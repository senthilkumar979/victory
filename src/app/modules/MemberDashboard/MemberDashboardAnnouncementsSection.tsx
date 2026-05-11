'use client'

import type { AnnouncementFormState } from '@/app/modules/Announcements/Announcement.types'
import { motion } from 'framer-motion'
import { Megaphone } from 'lucide-react'

interface MemberDashboardAnnouncementsSectionProps {
  announcements: AnnouncementFormState[]
  isLoading: boolean
  error: string | null
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

const MAX = 5
const PREVIEW_LEN = 160

export const MemberDashboardAnnouncementsSection = ({
  announcements,
  isLoading,
  error,
}: MemberDashboardAnnouncementsSectionProps) => {
  const list = announcements.slice(0, MAX)

  return (
    <section
      className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm"
      aria-labelledby="member-dashboard-announcements-heading"
    >
      <div className="mb-4 flex items-center gap-2">
        <Megaphone className="size-5 text-primary" aria-hidden />
        <h2
          id="member-dashboard-announcements-heading"
          className="text-lg font-semibold text-slate-900"
        >
          Announcements
        </h2>
      </div>

      {isLoading && (
        <ul className="space-y-3">
          {[1, 2, 3].map((i) => (
            <li
              key={i}
              className="h-16 animate-pulse rounded-xl bg-slate-100"
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
        <p className="text-sm text-slate-500">No announcements yet.</p>
      ) : null}

      {!isLoading && !error && list.length > 0 ? (
        <ul className="space-y-4">
          {list.map((a, i) => {
            const plain = stripHtml(a.description ?? '')
            const preview =
              plain.length > PREVIEW_LEN
                ? `${plain.slice(0, PREVIEW_LEN)}…`
                : plain
            return (
              <motion.li
                key={a.id ?? `${a.title}-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-slate-100 pb-4 last:border-0 last:pb-0"
              >
                <p className="font-medium text-slate-900">{a.title}</p>
                {a.created_at ? (
                  <p className="mt-0.5 text-xs text-slate-400">
                    {new Date(a.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                ) : null}
                {preview ? (
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {preview}
                  </p>
                ) : null}
              </motion.li>
            )
          })}
        </ul>
      ) : null}
    </section>
  )
}
