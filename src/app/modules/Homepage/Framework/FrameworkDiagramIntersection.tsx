'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface FrameworkDiagramIntersectionProps {
  isLinked: boolean
}

export const FrameworkDiagramIntersection = ({
  isLinked,
}: FrameworkDiagramIntersectionProps) => {
  const reduceMotion = useReducedMotion()

  return (
    <div className="relative z-30 flex items-center justify-center py-2">
      <motion.div
        className="absolute h-36 w-36 rounded-full bg-gradient-to-br from-[#d53f8c]/35 via-[#f472b6]/22 to-[#be185d]/28 blur-2xl"
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.12, 1], opacity: [0.5, 0.85, 0.5] }
        }
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />
      <motion.div
        className="absolute h-28 w-28 rounded-full border border-[#d53f8c]/45"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        aria-hidden
      />
      <motion.div
        className="absolute h-32 w-32 rounded-full border border-dashed border-[#f472b6]/40"
        animate={reduceMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 42, repeat: Infinity, ease: 'linear' }}
        aria-hidden
      />
      <motion.div
        className="absolute h-[8.5rem] w-[8.5rem] rounded-full bg-gradient-to-br from-[#d53f8c]/28 to-[#fbcfe8]/20 opacity-70 blur-md"
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.15, 1], opacity: [0.45, 0.75, 0.45] }
        }
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />
      <motion.div
        className="relative flex min-h-[7.5rem] min-w-[7.5rem] max-w-[12rem] flex-col items-center justify-center rounded-full bg-gradient-to-br from-[#9d174d] via-[#d53f8c] to-[#f472b6] px-3 py-2 text-center shadow-[0_0_40px_rgba(213,63,140,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] ring-1 ring-white/30 dark:shadow-[0_0_48px_rgba(213,63,140,0.28)]"
        animate={
          reduceMotion
            ? undefined
            : {
                scale: isLinked ? [1.05, 1.08, 1.05] : [1, 1.04, 1],
                opacity: [0.92, 1, 0.92],
              }
        }
        transition={{ duration: isLinked ? 1.8 : 3.2, repeat: Infinity, ease: 'easeInOut' }}
        aria-label="T-Shaped Professional — intersection of breadth and depth"
      >
        <span className="select-none text-[0.58rem] font-bold uppercase leading-snug tracking-[0.18em] text-white/95 sm:text-[0.65rem]">
          <span className="block">T-Shaped</span>
          <span className="mt-0.5 block">Professional</span>
        </span>
      </motion.div>
    </div>
  )
}
