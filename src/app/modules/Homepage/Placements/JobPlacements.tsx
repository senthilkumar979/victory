'use client'

import { useStudentsByPlacements } from '@/hooks/useStudentsByPlacements'
import { cn } from '@/lib/utils'
import { motion, useReducedMotion } from 'motion/react'

import { PlacementStudentCard } from './PlacementStudentCard'

const ease = [0.22, 1, 0.36, 1] as const

function PlacementSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.04]',
        className,
      )}
    >
      <div className="aspect-[4/5] animate-pulse bg-slate-700/50" />
      <div className="space-y-3 px-4 pb-5 pt-4">
        <div className="h-5 w-2/3 animate-pulse rounded-md bg-slate-700/50" />
        <div className="h-3 w-full animate-pulse rounded-md bg-slate-700/40" />
        <div className="h-3 w-4/5 animate-pulse rounded-md bg-slate-700/40" />
      </div>
    </div>
  )
}

export const JobPlacements = () => {
  const { students, loading, error } = useStudentsByPlacements()
  const reduce = useReducedMotion() ?? false

  return (
    <section className="relative isolate overflow-hidden bg-primary/2 py-10 sm:py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(99,102,241,0.14),transparent_55%),radial-gradient(ellipse_50%_40%_at_100%_80%,rgba(251,191,36,0.08),transparent_50%),radial-gradient(ellipse_45%_35%_at_0%_70%,rgba(56,189,248,0.07),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:64px_64px]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.header
          initial={{ opacity: 0, y: reduce ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-64px' }}
          transition={{ duration: reduce ? 0.2 : 0.65, ease }}
          className="mx-auto mb-14 max-w-3xl text-center sm:mb-18 flex flex-col items-center justify-center"
        >
          <p className="mb-5 text-center font-mono text-[11px] font-medium uppercase tracking-[0.35em] bg-primary w-fit p-2 text-center mx-auto text-white rounded-full">
            Placements
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Where our students{' '}
            <span className="bg-gradient-to-r from-pink-400 via-pink-500 to-primary bg-clip-text text-transparent">
              land their dream jobs
            </span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">
            Alumni in roles across leading teams. Tap a photo to open their full
            profile.
          </p>
        </motion.header>

        {error ? (
          <p className="rounded-2xl border border-red-500/20 bg-red-950/40 px-6 py-4 text-center text-sm text-red-200/90">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <PlacementSkeleton key={i} />
            ))}
          </div>
        ) : null}

        {!loading && !error && students.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center text-slate-400">
            Placement stories will appear here soon.
          </p>
        ) : null}

        {!loading && students.length > 0 ? (
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {students.map((student, index) => (
              <PlacementStudentCard
                key={student.id}
                student={student}
                index={index}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
