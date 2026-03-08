'use client'

import { Award } from 'lucide-react'
import { motion } from 'framer-motion'

import type { StudentAwardWithCategory } from '@/hooks/useStudentAwards'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

interface ProfileAwardsProps {
  awards: StudentAwardWithCategory[]
  loading: boolean
}

export const ProfileAwards = ({ awards, loading }: ProfileAwardsProps) => {
  if (loading) {
    return (
      <div>
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Awards
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100/80" />
          ))}
        </div>
      </div>
    )
  }

  if (awards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Award className="size-12 text-slate-200" />
        <p className="mt-2 text-sm text-slate-500">No awards yet</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
        <Award className="size-4" />
        Awards
      </h2>
      <div className="space-y-4">
        {awards.map((award, idx) => (
          <motion.div
            key={award.id}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.06 }}
            whileHover={{ x: 4 }}
            className="flex gap-4 rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50/80 to-white p-4 ring-1 ring-amber-200/50 transition-all hover:shadow-md"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/20">
              <Award className="size-6 text-amber-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {award.categoryName && (
                  <span className="rounded-lg bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    {award.categoryName}
                  </span>
                )}
                <span className="text-xs text-slate-500">
                  {formatDate(award.awardedOn)}
                </span>
              </div>
              {award.description && (
                <div
                  className="mt-2 line-clamp-2 text-sm text-slate-600"
                  dangerouslySetInnerHTML={{ __html: award.description }}
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
