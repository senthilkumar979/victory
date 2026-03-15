'use client'

import { format } from 'date-fns'

import { useHallOfFame } from '@/hooks/useHallOfFame'
import { StudentBatch } from '@/templates/StudentBatch'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useMemo } from 'react'

import type { HallOfFameEntry } from '@/app/modules/HallOfFame/HallOfFame.types'
import { StudentRole } from '@/ui/templates/StudentRole'

const formatInductionDate = (isoString: string): string => {
  try {
    const date = new Date(isoString)
    if (Number.isNaN(date.getTime())) return isoString
    return format(date, 'MMM d, yyyy')
  } catch {
    return isoString
  }
}

const BatchDisplay = ({ batch }: { batch: string | number }) => {
  const num = useMemo(
    () => (typeof batch === 'number' ? batch : Number(batch)),
    [batch],
  )
  return !Number.isNaN(num) ? (
    <StudentBatch batch={num} />
  ) : (
    <span className="text-xs text-slate-500">Batch {String(batch)}</span>
  )
}

interface InducteeCardProps {
  entry: HallOfFameEntry
  index: number
}

const InducteeCard = ({ entry, index }: InducteeCardProps) => {
  const { student, student_email, date_of_induction } = entry
  const name = student?.name ?? student_email.split('@')[0]
  const picture = student?.picture
  const batch = student?.batch
  const profileHref = student?.id ? `/students/${student.id}` : '/students'
  const role = student?.role ?? ''
  const company = student?.company ?? ''
  return (
    <motion.article
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        type: 'spring',
        damping: 21,
        stiffness: 225,
      }}
      className="relative h-full group transform rounded-3xl border-0 bg-gradient-to-br from-slate-100 via-white to-slate-50 shadow-xl shadow-slate-200/40 p-0 overflow-visible transition-all duration-400 hover:scale-[1.02] hover:shadow-2xl hover:bg-[radial-gradient(circle_at_70%_30%,rgba(80,56,255,0.07)_0%,rgba(255,255,255,0.84)_70%)]"
    >
      <div className="absolute right-6 top-6 z-10 h-9 w-9 rounded-full bg-gradient-to-br from-yellow-300/80 to-yellow-400 shadow-lg flex items-center justify-center border border-yellow-200/70">
        <svg
          width="20"
          height="20"
          fill="currentColor"
          className="text-yellow-700/90"
        >
          <path d="M10 1.5l2.24 6.04h6.35l-5.13 3.73 1.98 6.04L10 13.68 4.56 17.31l1.98-6.04L1.41 7.54h6.35L10 1.5z" />
        </svg>
      </div>
      <Link
        href={profileHref}
        className="block h-full relative px-7 pt-10 pb-7"
      >
        <div className="flex flex-col items-center justify-center">
          <div className="relative z-10 -mt-14 mb-4">
            {picture ? (
              <span className="relative inline-block">
                <img
                  src={picture}
                  alt={name}
                  className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-xl shadow-primary/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl"
                  loading="lazy"
                  width={96}
                  height={96}
                />
                <span className="absolute -inset-1 rounded-full border-2 border-primary/20 opacity-70 animate-pulse group-hover:border-primary/90"></span>
              </span>
            ) : (
              <span className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-indigo-600 text-4xl font-black text-white shadow-xl shadow-slate-300">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2 text-center  decoration-primary/60 decoration-2 underline-offset-4 transition-all duration-300">
            {name}
          </h3>
          {batch != null && batch !== '' && (
            <div className="mb-1 text-center">
              <BatchDisplay batch={batch} />
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center justify-center rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 border border-amber-200 shadow-sm">
              <svg
                className="w-4 h-4 mr-1 text-amber-400 -mt-0.5"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8 0l2.25 6.26H16l-5 3.64 1.9 6.1L8 12.33l-4.9 3.67 1.9-6.1-5-3.64h5.75z" />
              </svg>
              Inducted {formatInductionDate(date_of_induction)}
            </span>
          </div>
        </div>
        <div className="mt-7 mx-auto w-2/3 border-b-2 border-primary/20 group-hover:border-primary/65"></div>
        <div className="mt-6 flex flex-row items-center justify-center gap-2">
          <span className="text-sm text-primary group-hover:text-primary/80 font-medium transition">
            {company}
          </span>
          <StudentRole role={role} />
          <span className="sr-only">|</span>
        </div>
      </Link>
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-primary/10 group-hover:ring-primary/25 transition-all duration-400"></div>
      <div className="pointer-events-none absolute -inset-3 rounded-3xl bg-gradient-to-b from-primary/5 to-transparent opacity-50"></div>
    </motion.article>
  )
}

export const HallOfFameInductees = () => {
  const { entries, isLoading, error } = useHallOfFame()

  if (isLoading) {
    return (
      <div className="mb-20 flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-20 rounded-xl border border-slate-200 bg-slate-50/80 p-8 text-center">
        <p className="text-sm text-slate-600">
          Unable to load inductees at this time. Please check back later.
        </p>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="mb-20 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-12 text-center">
        <p className="text-slate-600">
          Our first inductees will be celebrated here soon.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Be the first to join the Hall of Fame.
        </p>
      </div>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6 }}
      className="mb-20"
    >
      <h2 className="mb-12 text-center text-3xl font-extrabold tracking-tight text-primary drop-shadow-lg">
        <span className="inline-block align-middle text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-600 to-secondary">
          Our Inductees
        </span>
      </h2>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 px-2">
        {entries.map((entry, index) => (
          <InducteeCard key={entry.id} entry={entry} index={index} />
        ))}
      </div>
    </motion.section>
  )
}
