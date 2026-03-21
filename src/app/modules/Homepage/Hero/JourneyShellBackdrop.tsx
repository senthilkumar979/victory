'use client'

import { motion } from 'motion/react'
import { useJourneyReducedMotion } from './useJourneyReducedMotion'

export const JourneyShellBackdrop = () => {
  const reduced = useJourneyReducedMotion()

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
      aria-hidden
    >
      <motion.div
        className="absolute -left-[18%] -top-[40%] h-[85%] w-[55%] rounded-full bg-cyan-500/[0.12] blur-[48px]"
        animate={
          reduced
            ? { opacity: 0.9 }
            : {
                x: [0, 18, -6, 0],
                y: [0, 14, 4, 0],
                scale: [1, 1.06, 1.02, 1],
                opacity: [0.75, 1, 0.85, 0.75],
              }
        }
        transition={
          reduced
            ? { duration: 0.3 }
            : { duration: 14, repeat: Infinity, ease: 'easeInOut' }
        }
      />
      <motion.div
        className="absolute -right-[10%] bottom-[-25%] h-[65%] w-[48%] rounded-full bg-indigo-500/[0.1] blur-[44px]"
        animate={
          reduced
            ? { opacity: 0.85 }
            : {
                x: [0, -14, 8, 0],
                y: [0, -10, 6, 0],
                scale: [1, 1.05, 1],
              }
        }
        transition={
          reduced
            ? { duration: 0.3 }
            : { duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }
        }
      />
      <motion.div
        className="absolute left-[35%] top-[20%] h-24 w-24 rounded-full bg-emerald-400/[0.07] blur-2xl"
        animate={reduced ? {} : { scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={
          reduced ? { duration: 0 } : { duration: 5, repeat: Infinity, ease: 'easeInOut' }
        }
      />
    </div>
  )
}
