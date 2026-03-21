'use client'

import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import { DesktopBridgeConnector } from './DesktopBridgeConnector'
import {
  DesktopJourneyHiredPanel,
  DesktopJourneyStudentPanel,
} from './desktopJourneyBlocks'
import type { JourneyPhase, TransformationCardData } from './Hero.types'
import { JourneyShellBackdrop } from './JourneyShellBackdrop'
import { MENTOR_BRIDGE } from './mentorBridgeCopy'
import {
  getHiredLineVariants,
  getHiredStagger,
  getStudentLineVariants,
  getStudentStagger,
  gridExpandTransition,
} from './transformationJourneyMotion'
import { useJourneyReducedMotion } from './useJourneyReducedMotion'

interface DesktopTransformationJourneyProps {
  data: TransformationCardData
  phase: JourneyPhase
}

export const DesktopTransformationJourney = ({
  data,
  phase,
}: DesktopTransformationJourneyProps) => {
  const reduced = useJourneyReducedMotion()
  const showBridge = phase >= 2
  const showOutcome = phase >= 3

  const gridTemplateColumns = showOutcome
    ? 'minmax(0,1fr) minmax(96px,132px) minmax(0,1fr)'
    : showBridge
    ? 'minmax(0,1fr) minmax(96px,132px) 0fr'
    : 'minmax(0,1fr) 0fr 0fr'

  const studentStagger = getStudentStagger(reduced)
  const studentLine = getStudentLineVariants(reduced)
  const hiredStagger = getHiredStagger(reduced)
  const hiredLine = getHiredLineVariants(reduced)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-md">
      <JourneyShellBackdrop />
      <motion.div
        className="relative z-10 grid w-full min-h-[220px] items-stretch gap-0 p-4 md:min-h-[240px] md:p-5 lg:min-h-[260px]"
        initial={false}
        animate={{ gridTemplateColumns }}
        transition={gridExpandTransition(reduced)}
      >
        <div className="relative min-w-0 overflow-hidden pr-2 md:pr-3">
          <motion.p
            className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {MENTOR_BRIDGE.labelStudent}
          </motion.p>
          <DesktopJourneyStudentPanel
            key={data.name}
            data={data}
            containerVariants={studentStagger}
            lineVariants={studentLine}
          />
        </div>

        <div
          className={cn(
            'relative flex min-w-0 flex-col items-center justify-center overflow-hidden',
            !showBridge && 'pointer-events-none',
          )}
          aria-hidden={!showBridge}
        >
          <DesktopBridgeConnector phase={phase} showBridge={showBridge} />
        </div>

        <div
          className={cn(
            'relative min-w-full overflow-hidden pl-2 md:pl-3',
            !showOutcome && 'pointer-events-none',
          )}
          aria-hidden={!showOutcome}
        >
          {showOutcome && (
            <DesktopJourneyHiredPanel
              key={data.name}
              data={data}
              showOutcome={showOutcome}
              containerVariants={hiredStagger}
              lineVariants={hiredLine}
            />
          )}
        </div>
      </motion.div>
    </div>
  )
}
