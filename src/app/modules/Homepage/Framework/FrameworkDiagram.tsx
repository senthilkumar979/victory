'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Brain,
  Briefcase,
  Cloud,
  Code,
  Database,
  DollarSign,
  MessageCircle,
  Server,
  Users,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { FrameworkDiagramBackdrop } from './FrameworkDiagramBackdrop'
import { FrameworkDiagramHorizontalPills } from './FrameworkDiagramHorizontalPills'
import { FrameworkDiagramIntersection } from './FrameworkDiagramIntersection'
import { FrameworkDiagramVerticalFlow } from './FrameworkDiagramVerticalFlow'
import { screenVariants } from './frameworkDiagramVariants'

interface SkillDef {
  label: string
  Icon: LucideIcon
}

const horizontalSkills: SkillDef[] = [
  { label: 'Communication', Icon: MessageCircle },
  { label: 'Finance', Icon: DollarSign },
  { label: 'Career', Icon: Briefcase },
  { label: 'Leadership', Icon: Users },
  { label: 'Knowledge', Icon: BookOpen },
]

const verticalSkills: SkillDef[] = [
  { label: 'React', Icon: Code },
  { label: 'Java', Icon: Server },
  { label: 'Cloud', Icon: Cloud },
  { label: 'Data', Icon: Database },
  { label: 'AI/DS', Icon: Brain },
]

export default function FrameworkDiagram() {
  const reduceMotion = useReducedMotion()
  const [hoverH, setHoverH] = useState<number | null>(null)
  const [hoverV, setHoverV] = useState<number | null>(null)
  const isLinked = hoverH !== null || hoverV !== null

  const clearH = useCallback(() => setHoverH(null), [])
  const clearV = useCallback(() => setHoverV(null), [])

  return (
    <motion.section
      className="relative isolate w-full overflow-hidden px-4 py-14 bg-white dark:bg-gray-950 "
      aria-label="MentorBridge T-Shaped Learning Model diagram"
      initial={reduceMotion ? false : 'hidden'}
      animate="show"
      variants={screenVariants}
    >
      <FrameworkDiagramBackdrop />
      <figure className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center">
        <FrameworkDiagramHorizontalPills
          skills={horizontalSkills}
          reduceMotion={reduceMotion}
          hoverH={hoverH}
          isLinked={isLinked}
          onHover={setHoverH}
          onLeaveRow={clearH}
        />

        <div
          className={`relative flex w-full flex-col items-center transition-[filter] duration-300 ease-in-out ${
            hoverH !== null
              ? 'drop-shadow-[0_0_20px_rgba(213,63,140,0.38)]'
              : ''
          }`}
        >
          <div
            className="relative h-10 w-2 overflow-hidden rounded-full bg-gradient-to-b from-[#9d2164] via-[#d53f8c] to-[#f472b6] shadow-[0_0_18px_rgba(213,63,140,0.55)]"
            aria-hidden
          >
            {!reduceMotion ? (
              <motion.div
                className="absolute inset-x-0 top-0 h-1/2 w-full bg-gradient-to-b from-white/50 to-transparent"
                animate={{ y: ['-100%', '280%'] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
              />
            ) : null}
          </div>
          <FrameworkDiagramIntersection isLinked={isLinked} />
        </div>

        <FrameworkDiagramVerticalFlow
          skills={verticalSkills}
          reduceMotion={reduceMotion}
          hoverV={hoverV}
          onHover={setHoverV}
          onLeave={clearV}
        />

        <figcaption className="relative z-10 mt-4 max-w-lg text-center text-sm font-medium tracking-tight text-gray-600 dark:text-gray-400">
          Building T-Shaped Professionals through Depth and Breadth
        </figcaption>
      </figure>
    </motion.section>
  )
}
