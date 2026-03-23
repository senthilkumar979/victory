'use client'

import { cn } from '@/lib/utils'
import type { ProfileData } from '@/types/student.types'
import { Briefcase, Building2, GraduationCap } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'

export interface PlacementStudentCardProps {
  student: Pick<
    ProfileData,
    'id' | 'name' | 'picture' | 'role' | 'company' | 'batch'
  >
  index: number
}

const spring = { type: 'spring' as const, stiffness: 380, damping: 28 }

export const PlacementStudentCard = ({
  student,
  index,
}: PlacementStudentCardProps) => {
  const reduce = useReducedMotion() ?? false
  const { id, name, picture, role, company, batch } = student

  return (
    <motion.article
      initial={{ opacity: 0, y: reduce ? 0 : 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ ...spring, delay: reduce ? 0 : index * 0.06 }}
      className="group relative mx-auto w-full max-w-[13.5rem] sm:max-w-[14rem]"
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.09] to-white/[0.02]',
          'shadow-[0_24px_48px_-12px_rgba(0,0,0,0.45)] backdrop-blur-xl',
          'transition-[border-color,box-shadow] duration-500 ease-out',
          'hover:border-amber-400/25 hover:shadow-[0_32px_64px_-16px_rgba(251,191,36,0.12)]',
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06)_0%,transparent_42%,rgba(251,191,36,0.04)_100%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <Link
          href={`/students/${id}`}
          className="relative block h-48 w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:h-56"
          aria-label={`View profile: ${name}`}
        >
          <motion.div
            className="relative h-full w-full"
            whileHover={reduce ? undefined : { scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            {picture ? (
              <Image
                src={picture}
                alt={name}
                fill
                sizes="(max-width: 640px) 100vw, 200px"
                className="object-cover object-center"
                priority={index < 3}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 text-3xl font-semibold text-white/90">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              aria-hidden
              style={{
                background:
                  'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.14) 50%, transparent 60%)',
              }}
            />
          </motion.div>
        </Link>

        <div className="relative space-y-2 px-1 pb-3.5 pt-3">
          <h3 className="text-sm font-semibold text-center leading-tight tracking-tight text-primary">
            {name}
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-300/95">
            {role ? (
              <li className="flex items-start gap-2">
                <Briefcase
                  className="mt-px size-3.5 shrink-0 text-secondary"
                  aria-hidden
                />
                <span className="leading-snug text-secondary font-semibold">
                  {role}
                </span>
              </li>
            ) : null}
            {company ? (
              <li className="flex items-start gap-2">
                <Building2
                  className="mt-px size-3.5 shrink-0 text-sky-400/90"
                  aria-hidden
                />
                <span className="leading-snug text-info font-bold">
                  {company}
                </span>
              </li>
            ) : null}
            {batch ? (
              <li className="flex items-start gap-2">
                <GraduationCap
                  className="mt-px size-3.5 shrink-0 text-emerald-400/90"
                  aria-hidden
                />
                <span className="leading-snug text-success font-bold">
                  {batch}
                </span>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </motion.article>
  )
}
