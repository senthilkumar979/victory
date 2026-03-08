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
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md lg:p-8"
      >
        <h2 className="mb-6 text-xl font-semibold text-slate-900">Awards</h2>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </motion.section>
    )
  }

  if (awards.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md lg:p-8"
    >
      <h2 className="mb-6 text-xl font-semibold text-slate-900">Awards</h2>
      <div className="space-y-4">
        {awards.map((award, idx) => (
          <motion.div
            key={award.id}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.06 }}
            className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:border-primary/20"
          >
            <div className="shrink-0 rounded-lg bg-primary/10 p-2">
              <Award className="size-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {award.categoryName && (
                  <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                    {award.categoryName}
                  </span>
                )}
                <span className="text-sm text-slate-500">
                  {formatDate(award.awardedOn)}
                </span>
              </div>
              {award.description && (
                <div
                  className="mt-2 text-sm text-slate-600 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: award.description }}
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
