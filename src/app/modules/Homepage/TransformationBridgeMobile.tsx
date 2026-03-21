'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { CARDS } from './data'
import {
  MobileTransformationJourney,
  type JourneyPhase,
} from './MobileTransformationJourney'
import {
  PHASE_BRIDGE_MS,
  PHASE_CYCLE_MS,
  PHASE_STUDENT_MS,
} from './transformationMobileTiming'

export const TransformationBridgeMobile = () => {
  const [cardIndex, setCardIndex] = useState(0)
  const [phase, setPhase] = useState<JourneyPhase>(1)

  const currentCard = CARDS[cardIndex]

  useEffect(() => {
    const toBridge = setTimeout(() => setPhase(2), PHASE_STUDENT_MS)
    const toOutcome = setTimeout(
      () => setPhase(3),
      PHASE_STUDENT_MS + PHASE_BRIDGE_MS,
    )
    const nextStudent = setTimeout(() => {
      setCardIndex((i) => (i + 1) % CARDS.length)
      setPhase(1)
    }, PHASE_CYCLE_MS)

    return () => {
      clearTimeout(toBridge)
      clearTimeout(toOutcome)
      clearTimeout(nextStudent)
    }
  }, [cardIndex])

  return (
    <div className="relative w-full max-w-sm md:hidden">
      <div className="relative z-10 flex flex-col items-stretch px-2 py-4">
        <div className="relative min-h-[500px] w-full min-w-0 max-w-[90vw]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={cardIndex}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="absolute inset-x-0 top-0"
            >
              <MobileTransformationJourney data={currentCard} phase={phase} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
