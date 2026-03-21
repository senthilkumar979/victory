'use client'

import { AnimatePresence, motion } from 'motion/react'
import { DesktopTransformationJourney } from './DesktopTransformationJourney'
import { MENTOR_BRIDGE } from './mentorBridgeCopy'
import { cardSwapTransition } from './transformationJourneyMotion'
import { useTransformationPhasedCycle } from './useTransformationPhasedCycle'
import { useJourneyReducedMotion } from './useJourneyReducedMotion'

export const TransformationBridge = () => {
  const { cardIndex, phase, currentCard } = useTransformationPhasedCycle()
  const reduced = useJourneyReducedMotion()

  return (
    <div className="relative w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl">
      <motion.header
        className="mb-5 px-4 text-center md:mb-6 md:px-6 md:text-left"
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={cardSwapTransition(reduced)}
      >
        <p className="text-[14px] font-semibold uppercase tracking-[0.28em] text-primary/90 text-center">
          {MENTOR_BRIDGE.stepEyebrow}
        </p>
      </motion.header>

      <div className="relative z-10 flex flex-col items-stretch px-4 py-2 md:px-6">
        <div className="relative min-h-[260px] w-full min-w-0 md:min-h-[280px] lg:min-h-[300px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={cardIndex}
              initial={
                reduced
                  ? { opacity: 0 }
                  : { opacity: 0, x: 52, filter: 'blur(12px)' }
              }
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={
                reduced
                  ? { opacity: 0 }
                  : { opacity: 0, x: -44, filter: 'blur(10px)' }
              }
              transition={cardSwapTransition(reduced)}
              className="absolute inset-x-0 top-0"
              aria-label={`${MENTOR_BRIDGE.headline} journey for ${currentCard.name}`}
            >
              <DesktopTransformationJourney data={currentCard} phase={phase} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
