'use client'

import { motion } from 'motion/react'
import type { JourneyPhase, TransformationCardData } from './Hero.types'
import { JourneyShellBackdrop } from './JourneyShellBackdrop'
import { MobileJourneyHiredCard, MobileJourneyStudentCard } from './mobileJourneyBlocks'
import { MobileBridgeVertical } from './MobileBridgeVertical'
import { MENTOR_BRIDGE } from './mentorBridgeCopy'
import {
  easeOutExpo,
  getHiredLineVariants,
  getHiredStagger,
  getStudentLineVariants,
  getStudentStagger,
} from './transformationJourneyMotion'
import { useJourneyReducedMotion } from './useJourneyReducedMotion'

export type { JourneyPhase }

const T = 0.75

const reveal = { duration: T, ease: easeOutExpo }

interface MobileTransformationJourneyProps {
  data: TransformationCardData
  phase: JourneyPhase
}

export const MobileTransformationJourney = ({
  data,
  phase,
}: MobileTransformationJourneyProps) => {
  const reduced = useJourneyReducedMotion()
  const showBridge = phase >= 2
  const showOutcome = phase >= 3

  const studentStagger = getStudentStagger(reduced)
  const studentLine = getStudentLineVariants(reduced)
  const hiredStagger = getHiredStagger(reduced)
  const hiredLine = getHiredLineVariants(reduced)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-md">
      <JourneyShellBackdrop />
      <div className="relative z-10">
        <div className="relative px-4 pt-4">
          <motion.p
            className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: easeOutExpo }}
          >
            {MENTOR_BRIDGE.labelStudent}
          </motion.p>
          <MobileJourneyStudentCard
            key={data.name}
            data={data}
            containerVariants={studentStagger}
            lineVariants={studentLine}
          />
        </div>

        <motion.div
          initial={false}
          animate={{
            opacity: showBridge ? 1 : 0,
            height: showBridge ? 'auto' : 0,
          }}
          transition={reveal}
          className="overflow-hidden"
          aria-hidden={!showBridge}
        >
          <MobileBridgeVertical phase={phase} showBridge={showBridge} />
        </motion.div>

        <motion.div
          initial={false}
          animate={{
            opacity: showOutcome ? 1 : 0,
            height: showOutcome ? 'auto' : 0,
          }}
          transition={reveal}
          className="overflow-hidden"
          aria-hidden={!showOutcome}
        >
          <div className="px-4 pb-4 pt-2">
            <motion.p
              className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: showOutcome ? 1 : 0 }}
              transition={{ duration: 0.35 }}
            >
              {MENTOR_BRIDGE.labelHired}
            </motion.p>
            <MobileJourneyHiredCard
              key={data.name}
              data={data}
              showOutcome={showOutcome}
              containerVariants={hiredStagger}
              lineVariants={hiredLine}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
