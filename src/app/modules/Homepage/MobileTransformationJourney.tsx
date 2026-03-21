'use client'

import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import type { TransformationCardData } from './Hero.types'

const T = 0.75

const transitionSlow = { duration: T, ease: 'easeOut' as const }
const transitionMedium = { duration: T * 0.6, ease: 'easeOut' as const }

interface MobileTransformationJourneyProps {
  data: TransformationCardData
  isProfessional: boolean
  showBridgeGlow: boolean
}

export const MobileTransformationJourney = ({
  data,
  isProfessional,
  showBridgeGlow,
}: MobileTransformationJourneyProps) => (
  <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-md">
    <motion.div
      className="relative px-4 pt-4"
      animate={{
        opacity: isProfessional ? 0.45 : 1,
        filter: isProfessional ? 'blur(0.5px)' : 'blur(0px)',
      }}
      transition={transitionSlow}
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        Arrives as student
      </p>
      <div className="flex flex-col gap-2 bg-white pl-3 pr-3 py-4 rounded-lg">
        <span className="inline-flex rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary w-fit">
          Student
        </span>
        <h4 className="mt-2 font-semibold text-info">{data.name}</h4>
        <p className="text-sm text-slate-400">{data.studentDept}</p>
        <p className="text-xs text-slate-500">{data.studentCollege}</p>
      </div>
    </motion.div>

    <div className="relative flex flex-col items-center px-4 py-3">
      <div className="h-6 w-px bg-gradient-to-b from-transparent via-primary/50 to-primary/70" />
      <motion.div
        className="relative z-10 py-1.5 text-center"
        animate={{ scale: showBridgeGlow ? 1.03 : 1 }}
        transition={transitionMedium}
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
            opacity: showBridgeGlow ? 1 : 0.35,
            boxShadow: showBridgeGlow
              ? '0 0 20px rgba(6,182,212,0.45)'
              : '0 0 0 rgba(0,0,0,0)',
          }}
          transition={transitionMedium}
        />
      </div>
    </div>

    <div
      className={cn(
        'border-t px-4 pb-4 pt-3 transition-colors duration-500',
        isProfessional
          ? 'border-primary/35 bg-primary'
          : 'border-white/10 bg-transparent',
      )}
    >
      <p
        className={cn(
          'mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white',
          isProfessional ? 'text-white' : 'text-slate-500',
        )}
      >
        {isProfessional ? 'Hired — out in industry' : 'After training'}
      </p>
      <AnimatePresence mode="wait">
        {isProfessional ? (
          <motion.div
            key="hired"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={transitionSlow}
            className="space-y-2"
          >
            <span className="inline-flex rounded-full bg-success/90 px-2.5 py-0.5 text-xs font-semibold text-white">
              Hired
            </span>
            <p className="text-sm border-l-2 border-white text-white px-2 py-1 w-fit-content">
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
          </motion.div>
        ) : (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] py-4 text-center"
          >
            <p className="text-xs text-slate-500">
              Path continues to placement...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
)
