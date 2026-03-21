'use client'

import { AnimatePresence, motion } from 'motion/react'
import { MobileTransformationJourney } from './MobileTransformationJourney'
import { MENTOR_BRIDGE } from './mentorBridgeCopy'
import { cardSwapTransition } from './transformationJourneyMotion'
import { useTransformationPhasedCycle } from './useTransformationPhasedCycle'
import { useJourneyReducedMotion } from './useJourneyReducedMotion'

export const TransformationBridgeMobile = () => {
  const { cardIndex, phase, currentCard } = useTransformationPhasedCycle()
  const reduced = useJourneyReducedMotion()

  return (
    <div className="relative w-full max-w-sm md:hidden">
      <motion.header
        className="mb-4 px-2 text-center"
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={cardSwapTransition(reduced)}
      >
        <p className="text-[9px] font-semibold uppercase tracking-[0.26em] text-primary/90">
          {MENTOR_BRIDGE.stepEyebrow}
        </p>
      </motion.header>

      <div className="relative z-10 flex flex-col items-stretch px-2 py-2">
        <div className="relative min-h-[500px] w-full min-w-0 max-w-[90vw]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={cardIndex}
              initial={
                reduced ? { opacity: 0 } : { opacity: 0, y: 36, scale: 0.96 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                reduced ? { opacity: 0 } : { opacity: 0, y: -28, scale: 0.96 }
              }
              transition={cardSwapTransition(reduced)}
              className="absolute inset-x-0 top-0"
              aria-label={`${MENTOR_BRIDGE.headline} journey for ${currentCard.name}`}
            >
              <MobileTransformationJourney data={currentCard} phase={phase} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
