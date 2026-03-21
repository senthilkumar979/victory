'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { nodeItem, staggerCol } from './frameworkDiagramVariants'

interface SkillDef {
  label: string
  Icon: LucideIcon
}

interface FrameworkDiagramVerticalFlowProps {
  skills: SkillDef[]
  reduceMotion: boolean | null
  hoverV: number | null
  onHover: (index: number) => void
  onLeave: () => void
}

export const FrameworkDiagramVerticalFlow = ({
  skills,
  reduceMotion,
  hoverV,
  onHover,
  onLeave,
}: FrameworkDiagramVerticalFlowProps) => (
  <div
    className="relative mt-1 flex w-full max-w-md flex-col items-center md:max-w-lg"
    onMouseLeave={onLeave}
  >
    <div
      className={`pointer-events-none absolute left-1/2 top-0 bottom-8 w-2.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-[#9d2164] via-[#d53f8c] to-[#f472b6] transition-[opacity,box-shadow] duration-300 ease-in-out ${
        hoverV !== null
          ? 'opacity-100 shadow-[0_0_32px_rgba(213,63,140,0.55)]'
          : 'opacity-90 shadow-[0_0_24px_rgba(213,63,140,0.38)]'
      }`}
      aria-hidden
    />
    {!reduceMotion ? (
      <motion.div
        className="pointer-events-none absolute left-1/2 top-0 bottom-8 w-2 -translate-x-1/2 overflow-hidden rounded-full opacity-50"
        aria-hidden
      >
        <motion.div
          className="h-1/2 w-full bg-gradient-to-b from-[#fbcfe8]/90 to-transparent"
          animate={{ y: ['-20%', '220%'] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
    ) : null}

    <motion.ul
      className="relative z-10 flex w-full flex-col items-center gap-0 pb-2"
      variants={staggerCol}
      initial={reduceMotion ? false : 'hidden'}
      animate="show"
    >
      {skills.map(({ label, Icon }, i) => (
        <li key={label} className="flex list-none flex-col items-center">
          <motion.div
            variants={nodeItem}
            className="flex w-full max-w-sm items-center gap-8 py-2"
            onMouseEnter={() => onHover(i)}
            aria-label={`Deep vertical skill: ${label}`}
          >
            <div
              className={`relative flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center rounded-full border bg-gradient-to-br from-slate-900/5 to-white/10 shadow-[0_8px_28px_rgba(15,23,42,0.12)] backdrop-blur-md transition-[transform,box-shadow,border-color] duration-300 ease-out dark:from-gray-950/80 dark:to-gray-900/40 dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] md:h-14 md:w-14 ${
                hoverV === i
                  ? 'scale-110 border-[#f472b6]/85 shadow-[0_0_32px_rgba(213,63,140,0.45)] ring-2 ring-[#d53f8c]/45'
                  : 'border-white/30 hover:scale-105 hover:border-[#fbcfe8]/70 dark:border-white/15'
              }`}
              aria-hidden
            >
              <Icon className="h-5 w-5 text-[#be185d] dark:text-[#f9a8d4]" />
            </div>
            <div
              className={`max-w-[14rem] rounded-2xl border border-white/30 bg-white/20 px-4 py-2 text-center shadow-inner backdrop-blur-md transition-[box-shadow,transform] duration-300 ease-in-out dark:border-white/10 dark:bg-gray-950/50 ${
                hoverV === i
                  ? 'scale-[1.03] shadow-[0_0_24px_rgba(213,63,140,0.28)]'
                  : ''
              }`}
            >
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                {label}
              </p>
            </div>
          </motion.div>
        </li>
      ))}
    </motion.ul>
  </div>
)
