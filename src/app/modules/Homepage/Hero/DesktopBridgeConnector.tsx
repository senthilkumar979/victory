'use client'

import { motion } from 'motion/react'
import type { JourneyPhase } from './Hero.types'
import { MENTOR_BRIDGE } from './mentorBridgeCopy'
import { easeOutExpo, springSoft } from './transformationJourneyMotion'
import { useJourneyReducedMotion } from './useJourneyReducedMotion'

interface DesktopBridgeConnectorProps {
  phase: JourneyPhase
  showBridge: boolean
}

export const DesktopBridgeConnector = ({
  phase,
  showBridge,
}: DesktopBridgeConnectorProps) => {
  const reduced = useJourneyReducedMotion()
  if (!showBridge) return null

  const lineIn = reduced
    ? { duration: 0.15 }
    : { duration: 0.65, ease: easeOutExpo }

  return (
    <div className="flex h-full min-h-[180px] w-full max-w-[132px] flex-col items-center justify-center gap-3 px-1">
      <motion.div
        className="h-px w-full origin-left rounded-full bg-gradient-to-r from-transparent via-primary/50 to-primary/70"
        initial={reduced ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={lineIn}
      />
      <motion.div
        layout
        className="relative z-10 text-center"
        initial={reduced ? false : { opacity: 0, y: 8, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={springSoft}
      >
        <motion.span
          className="block text-[10px] font-black uppercase tracking-[0.25em] text-primary md:text-[11px]"
          animate={
            reduced
              ? { scale: 1 }
              : {
                  scale: [1, 1.03, 1],
                  textShadow: [
                    '0 0 0px transparent',
                    '0 0 22px rgba(99,102,241,0.45)',
                    '0 0 0px transparent',
                  ],
                }
          }
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          {MENTOR_BRIDGE.headline}
        </motion.span>
        <p className="mt-0.5 text-[9px] font-medium text-slate-500 md:text-[10px] uppercase">
          {MENTOR_BRIDGE.bridgeDetail}
        </p>
      </motion.div>

      <div className="relative h-9 w-full">
        <motion.div
          className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary/60 via-cyan-400/50 to-success/50"
          initial={reduced ? false : { scaleX: 0 }}
          animate={{
            scaleX: 1,
            boxShadow:
              showBridge && phase === 2
                ? '0 0 26px rgba(6,182,212,0.55)'
                : showBridge
                ? '0 0 14px rgba(6,182,212,0.38)'
                : 'none',
          }}
          transition={{
            scaleX: { ...lineIn, delay: reduced ? 0 : 0.08 },
            boxShadow: {
              duration: 0.45,
              repeat: phase === 2 && !reduced ? Infinity : 0,
              repeatType: 'reverse',
            },
          }}
          style={{ transformOrigin: 'left center' }}
        />
        {!reduced && (
          <motion.span
            className="absolute left-0 top-1/2 size-2 -translate-y-1/2 rounded-full bg-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.95)]"
            animate={{ x: [0, 112, 0], opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      <motion.div
        className="h-px w-full origin-right rounded-full bg-gradient-to-r from-primary/70 via-cyan-400/40 to-success/40"
        initial={reduced ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ ...lineIn, delay: reduced ? 0 : 0.14 }}
        style={{ transformOrigin: 'right center' }}
      />
    </div>
  )
}
