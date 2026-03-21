'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  horizontalRotationsDeg,
  pillItem,
  staggerRow,
} from './frameworkDiagramVariants'

interface SkillDef {
  label: string
  Icon: LucideIcon
}

const pillBase =
  'relative flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-4 py-2.5 shadow-[0_8px_32px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-[box-shadow,transform,border-color] duration-300 ease-out dark:border-white/10 dark:bg-gray-950/40 dark:shadow-[0_12px_40px_rgba(0,0,0,0.45]'

interface FrameworkDiagramHorizontalPillsProps {
  skills: SkillDef[]
  reduceMotion: boolean | null
  hoverH: number | null
  isLinked: boolean
  onHover: (index: number) => void
  onLeaveRow: () => void
}

export const FrameworkDiagramHorizontalPills = ({
  skills,
  reduceMotion,
  hoverH,
  isLinked,
  onHover,
  onLeaveRow,
}: FrameworkDiagramHorizontalPillsProps) => (
  <div className="relative mb-2 w-full max-w-4xl px-2 md:px-4">
    <div
      className={`pointer-events-none absolute left-6 right-6 top-1/2 z-0 h-[3px] -translate-y-1/2 rounded-full bg-gradient-to-r from-[#d53f8c]/25 via-[#f472b6]/50 to-[#fbcfe8]/40 blur-sm transition-opacity duration-300 md:left-10 md:right-10 ${
        isLinked ? 'opacity-100' : 'opacity-70'
      }`}
      aria-hidden
    />
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-px w-[72%] max-w-3xl -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-[#d53f8c]/80 to-transparent opacity-90 shadow-[0_0_24px_rgba(213,63,140,0.55)] mt-6 sm:mt-6 lg:mt-0"
      aria-hidden
    />
    <motion.ul
      className="relative z-10 flex flex-wrap items-center justify-center gap-3 md:gap-4"
      variants={staggerRow}
      initial={reduceMotion ? false : 'hidden'}
      animate="show"
      onMouseLeave={onLeaveRow}
    >
      {skills.map(({ label, Icon }, i) => (
        <motion.li key={label} variants={pillItem} className="list-none">
          <motion.div
            className={`${pillBase} ${
              hoverH === i
                ? 'scale-[1.06] border-[#f472b6]/80 shadow-[0_0_28px_rgba(213,63,140,0.45)] ring-2 ring-[#d53f8c]/35 dark:border-[#f472b6]/55'
                : 'hover:scale-[1.05] hover:border-[#fbcfe8]/90 hover:shadow-[0_0_22px_rgba(213,63,140,0.28)]'
            }`}
            style={{ rotate: horizontalRotationsDeg[i] ?? 0 }}
            animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
            transition={{
              y: {
                duration: 3.8 + i * 0.35,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
            onHoverStart={() => onHover(i)}
            whileHover={reduceMotion ? undefined : { y: -6, scale: 1.06 }}
            aria-label={`Horizontal intelligence: ${label}`}
          >
            <Icon
              className="h-4 w-4 shrink-0 text-[#be185d] dark:text-[#f9a8d4]"
              aria-hidden
            />
            <span className="text-sm font-medium tracking-tight text-gray-900 dark:text-gray-100">
              {label}
            </span>
          </motion.div>
        </motion.li>
      ))}
    </motion.ul>
  </div>
)
