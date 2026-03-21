'use client'

import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import type { TransformationCardData } from './Hero.types'

const T = 0.75

const reveal = { duration: T, ease: 'easeOut' as const }

export type JourneyPhase = 1 | 2 | 3

interface MobileTransformationJourneyProps {
  data: TransformationCardData
  phase: JourneyPhase
}

export const MobileTransformationJourney = ({
  data,
  phase,
}: MobileTransformationJourneyProps) => {
  const showBridge = phase >= 2
  const showOutcome = phase >= 3

  return (
    <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-md">
      {/* Section 1 — always mounted while this card is shown */}
      <div className="relative px-4 pt-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Arrives as student
        </p>
        <motion.div
          initial={{ opacity: 0, scaleY: 0.85, y: -24 }}
          animate={{ opacity: 1, scaleY: 1, y: 0 }}
          exit={{ opacity: 0, scaleY: 0.85, y: -20 }}
          transition={reveal}
          style={{ originY: 0 }}
          className="flex flex-col gap-2 rounded-lg bg-white py-4 pl-3 pr-3"
        >
          <motion.span
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: T * 0.7, delay: T * 0.15, ease: 'easeOut' }}
            className="inline-flex w-fit rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary"
          >
            Student
          </motion.span>
          <motion.h4
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: T * 0.7, delay: T * 0.22, ease: 'easeOut' }}
            className="mt-2 font-semibold text-info"
          >
            {data.name}
          </motion.h4>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: T * 0.7, delay: T * 0.29, ease: 'easeOut' }}
            className="text-sm text-slate-400"
          >
            {data.studentDept}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: T * 0.7, delay: T * 0.36, ease: 'easeOut' }}
            className="text-xs text-slate-500"
          >
            {data.studentCollege}
          </motion.p>
        </motion.div>
      </div>

      {/* Section 2 — revealed in phase 2+, stays for phase 3 */}
      <motion.div
        initial={false}
        animate={{
          opacity: showBridge ? 1 : 0,
          height: showBridge ? 'auto' : 0,
        }}
        transition={reveal}
        className="overflow-hidden"
        aria-hidden={!showBridge}
      >
        <div className="relative flex flex-col items-center px-4 py-3">
          <div className="h-6 w-px bg-gradient-to-b from-transparent via-primary/50 to-primary/70" />
          <motion.div
            className="relative z-10 py-1.5 text-center"
            animate={{ scale: showBridge ? 1 : 0.98 }}
            transition={reveal}
          >
            <span className="text-[11px] font-black uppercase tracking-[0.35em] text-primary">
              MentorBridge
            </span>
            <p className="mt-0.5 text-[10px] font-medium text-slate-500">
              Training & mentorship
            </p>
          </motion.div>
          <div className="relative h-6 w-px overflow-hidden rounded-full bg-gradient-to-b from-primary/70 via-cyan-400/50 to-success/40">
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-cyan-400/40 via-white/30 to-success/50"
              animate={{
                opacity: showBridge ? 1 : 0.35,
                boxShadow:
                  showBridge && phase === 2
                    ? '0 0 24px rgba(6,182,212,0.5)'
                    : showBridge
                    ? '0 0 16px rgba(6,182,212,0.35)'
                    : 'none',
              }}
              transition={{
                duration: 0.45,
                repeat: phase === 2 ? Infinity : 0,
                repeatType: 'reverse',
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Section 3 — revealed in phase 3 only */}
      <motion.div
        initial={false}
        animate={{
          opacity: showOutcome ? 1 : 0,
          height: showOutcome ? 'auto' : 0,
        }}
        transition={reveal}
        className="overflow-hidden"
        aria-hidden={!showOutcome}
      >
        <div
          className={cn(
            'border px-4 pb-4 pt-3 transition-colors duration-500',
            'border-primary/35 bg-primary rounded-lg',
          )}
        >
          <div className="space-y-2">
            <span className="inline-flex rounded-full bg-success/90 px-2.5 py-0.5 text-xs font-semibold text-white">
              Hired
            </span>
            <h4 className="mt-2 font-semibold text-white">{data.name}</h4>
            <p className="w-fit border-l-2 border-white px-2 py-1 text-sm text-white">
              {data.professionalRole}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-700/50 text-xs font-bold text-white">
                {data.professionalCompany.slice(0, 2)}
              </div>
              <p className="truncate text-xs font-medium text-white">
                {data.professionalCompany}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
