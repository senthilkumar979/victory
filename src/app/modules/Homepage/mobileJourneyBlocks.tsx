'use client'

import { motion, type Variants } from 'motion/react'
import Image from 'next/image'
import type { TransformationCardData } from './Hero.types'
import { springPop } from './transformationJourneyMotion'
import { useJourneyReducedMotion } from './useJourneyReducedMotion'

interface StudentCardProps {
  data: TransformationCardData
  containerVariants: Variants
  lineVariants: Variants
}

export const MobileJourneyStudentCard = ({
  data,
  containerVariants,
  lineVariants,
}: StudentCardProps) => {
  const reduced = useJourneyReducedMotion()

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, scale: 0.94, y: -16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={reduced ? { duration: 0.2 } : springPop}
    >
      <motion.div
        className="flex flex-col gap-2 rounded-lg bg-white py-4 pl-3 pr-3 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.25)]"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.span
          variants={lineVariants}
          className="inline-flex w-fit rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary"
        >
          Student
        </motion.span>
        <div className="flex items-center gap-2 justify-center flex-col">
        <Image src={data.picture} alt={data.name} width={100} height={100} className="w-10 h-10 object-cover rounded-full" />
        <motion.h4 variants={lineVariants} className="mt-2 font-semibold text-info">
          {data.name}
        </motion.h4>
        <motion.p variants={lineVariants} className="text-sm text-slate-400">
          {data.studentDept}
        </motion.p>
          <motion.p variants={lineVariants} className="text-xs text-slate-500">
            {data.studentCollege}
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  )
}

interface HiredCardProps {
  data: TransformationCardData
  showOutcome: boolean
  containerVariants: Variants
  lineVariants: Variants
}

export const MobileJourneyHiredCard = ({
  data,
  showOutcome,
  containerVariants,
  lineVariants,
}: HiredCardProps) => {
  const reduced = useJourneyReducedMotion()

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={reduced ? { duration: 0.2 } : springPop}
    >
      <motion.div
        className="rounded-lg border border-primary/35 bg-primary p-4 shadow-[0_16px_48px_-12px_rgba(79,70,229,0.45)]"
        variants={containerVariants}
        initial="hidden"
        animate={showOutcome ? 'show' : 'hidden'}
      >
        <motion.span
          variants={lineVariants}
          className="inline-flex rounded-full bg-success/90 px-2.5 py-0.5 text-xs font-semibold text-white"
        >
          Hired
        </motion.span>
        <div className="flex items-center gap-2 justify-center flex-col">
        <Image src={data.picture} alt={data.name} width={100} height={100} className="w-10 h-10 object-cover rounded-full" />
        <motion.h4 variants={lineVariants} className="mt-2 font-semibold text-white">
          {data.name}
        </motion.h4>
        <motion.p
          variants={lineVariants}
          className="mt-1 w-fit border-l-2 border-white px-2 py-1 text-sm text-white"
        >
          {data.professionalRole}
        </motion.p>
        <motion.div variants={lineVariants} className="mt-2 flex items-center gap-2">
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
