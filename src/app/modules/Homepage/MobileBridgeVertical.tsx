'use client'

import { motion } from 'motion/react'
import type { JourneyPhase } from './Hero.types'
import { MENTOR_BRIDGE } from './mentorBridgeCopy'
import { easeOutExpo, springSoft } from './transformationJourneyMotion'
import { useJourneyReducedMotion } from './useJourneyReducedMotion'

interface MobileBridgeVerticalProps {
  phase: JourneyPhase
  showBridge: boolean
}

export const MobileBridgeVertical = ({ phase, showBridge }: MobileBridgeVerticalProps) => {
  const reduced = useJourneyReducedMotion()
  if (!showBridge) return null

  const lineT = reduced ? { duration: 0.15 } : { duration: 0.55, ease: easeOutExpo }

  return (
    <div className="relative flex flex-col items-center px-4 py-3">
      <motion.div
        className="h-6 w-px origin-top rounded-full bg-gradient-to-b from-transparent via-primary/60 to-primary/80"
        initial={reduced ? false : { scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={lineT}
      />
      <motion.div
        layout
        className="relative z-10 py-2 text-center"
        initial={false}
        animate={{ scale: 1, opacity: 1 }}
        transition={springSoft}
      >
        <motion.span
          className="block text-[11px] font-black uppercase tracking-[0.35em] text-primary"
          animate={
            reduced
              ? { y: 0 }
              : { y: [0, -2, 0], textShadow: ['0 0 0px transparent', '0 0 20px rgba(6,182,212,0.35)', '0 0 0px transparent'] }
          }
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          {MENTOR_BRIDGE.headline}
        </motion.span>
        <p className="mt-1 text-[10px] font-semibold text-slate-400">
          {MENTOR_BRIDGE.bridgeTagline}
        </p>
        <p className="mt-0.5 text-[10px] font-medium text-slate-500">
          {MENTOR_BRIDGE.bridgeDetail}
        </p>
      </motion.div>
      <div className="relative h-7 w-px overflow-hidden rounded-full">
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-primary/70 via-cyan-400/50 to-success/50"
          animate={{
            opacity: showBridge ? 1 : 0.35,
            boxShadow:
              showBridge && phase === 2
                ? '0 0 28px rgba(6,182,212,0.55)'
                : showBridge
                  ? '0 0 14px rgba(6,182,212,0.35)'
                  : 'none',
          }}
          transition={{
            duration: 0.45,
            repeat: phase === 2 && !reduced ? Infinity : 0,
            repeatType: 'reverse',
          }}
        />
        {!reduced && (
          <motion.div
            className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
            animate={{ y: [0, 22, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>
    </div>
  )
}
