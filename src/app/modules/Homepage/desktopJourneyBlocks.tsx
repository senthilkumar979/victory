'use client'

import { motion, type Variants } from 'motion/react'
import type { TransformationCardData } from './Hero.types'
import { MENTOR_BRIDGE } from './mentorBridgeCopy'
import { springPop } from './transformationJourneyMotion'
import { useJourneyReducedMotion } from './useJourneyReducedMotion'
import Image from 'next/image'

interface DesktopStudentProps {
  data: TransformationCardData
  containerVariants: Variants
  lineVariants: Variants
}

export const DesktopJourneyStudentPanel = ({
  data,
  containerVariants,
  lineVariants,
}: DesktopStudentProps) => {
  const reduced = useJourneyReducedMotion()

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, x: -28, filter: 'blur(8px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      transition={reduced ? { duration: 0.2 } : springPop}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex h-full flex-col gap-2 rounded-lg bg-white py-4 pl-3 pr-3 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.22)]"
      >
        <motion.span
          variants={lineVariants}
          className="inline-flex w-fit rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary"
        >
          Student
        </motion.span>
        <div className="flex items-center gap-2 justify-center flex-col">
        <Image src={data.picture} alt={data.name} width={100} height={100} className="w-10 h-10 object-cover rounded-full" />
        <motion.h4 variants={lineVariants} className="mt-1 font-semibold text-info">
          {data.name}
        </motion.h4>
        <motion.p variants={lineVariants} className="text-sm text-slate-400">
          {data.studentDept}
        </motion.p>
        <motion.p variants={lineVariants} className="text-xs text-slate-500 text-center">
          {data.studentCollege}
        </motion.p>
        </div>
      </motion.div>
    </motion.div>
  )
}

interface DesktopHiredProps {
  data: TransformationCardData
  showOutcome: boolean
  containerVariants: Variants
  lineVariants: Variants
}

export const DesktopJourneyHiredPanel = ({
  data,
  showOutcome,
  containerVariants,
  lineVariants,
}: DesktopHiredProps) => {
  const reduced = useJourneyReducedMotion()

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, x: 28, filter: 'blur(8px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      transition={reduced ? { duration: 0.2 } : springPop}
    >
      <motion.p
        className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: showOutcome ? 1 : 0 }}
      >
        {MENTOR_BRIDGE.labelHired}
      </motion.p>
      <motion.div
        className="flex h-full flex-col gap-2 rounded-lg border border-primary/35 bg-primary p-4 shadow-[0_16px_48px_-12px_rgba(79,70,229,0.4)]"
        variants={containerVariants}
        initial="hidden"
        animate={showOutcome ? 'show' : 'hidden'}
      >
        <motion.span
          variants={lineVariants}
          className="inline-flex w-fit rounded-full bg-success/90 px-2.5 py-0.5 text-xs font-semibold text-white"
        >
          Hired
        </motion.span>
        <div className="flex items-center gap-2 justify-center flex-col">
        <Image src={data.picture} alt={data.name} width={100} height={100} className="w-10 h-10 object-cover rounded-full" />
        <motion.h4 variants={lineVariants} className="mt-1 font-semibold text-white">
          {data.name}
        </motion.h4>
        <motion.p
          variants={lineVariants}
          className="w-fit border-l-2 border-white px-2 py-1 text-sm text-white"
        >
          {data.professionalRole}
        </motion.p>
        <motion.div variants={lineVariants} className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-700/50 text-xs font-bold text-white">
            {data.professionalCompany.slice(0, 2)}
          </div>
          <p className="truncate text-xs font-medium text-white">
            {data.professionalCompany}
          </p>
          </motion.div>
          </div>
      </motion.div>
    </motion.div>
  )
}
