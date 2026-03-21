'use client'

import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { CARDS } from './data'
import { MobileTransformationJourney } from './MobileTransformationJourney'
import {
  CARD_CYCLE_MS,
  STUDENT_MIN_DISPLAY_MS,
} from './transformationMobileTiming'

const CARD_DURATION_MS = CARD_CYCLE_MS
const STUDENT_PHASE_MS = STUDENT_MIN_DISPLAY_MS

export const TransformationBridgeMobile = () => {
  const [cardIndex, setCardIndex] = useState(0)
  const [isProfessional, setIsProfessional] = useState(false)
  const [showBridgeGlow, setShowBridgeGlow] = useState(false)

  const currentCard = CARDS[cardIndex]

  useEffect(() => {
    const studentTimer = setTimeout(() => {
      setShowBridgeGlow(true)
      setIsProfessional(true)
    }, STUDENT_PHASE_MS)

    const glowOffTimer = setTimeout(
      () => setShowBridgeGlow(false),
      STUDENT_PHASE_MS + 400,
    )

    const nextCardTimer = setTimeout(() => {
      setCardIndex((i) => (i + 1) % CARDS.length)
      setIsProfessional(false)
    }, CARD_DURATION_MS)

    return () => {
      clearTimeout(studentTimer)
      clearTimeout(glowOffTimer)
      clearTimeout(nextCardTimer)
    }
  }, [cardIndex])

  return (
    <div className="relative w-full max-w-sm md:hidden">
      <div className="relative z-10 flex flex-col items-stretch px-2 py-4">
        <div className="relative min-h-[450px] w-full min-w-0 max-w-[90vw]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={cardIndex}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="absolute inset-x-0 top-0"
            >
              <MobileTransformationJourney
                data={currentCard}
                isProfessional={isProfessional}
                showBridgeGlow={showBridgeGlow}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          className="mt-5 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            More stories
          </p>
          <div
            className="flex flex-wrap items-center justify-center gap-2"
            role="tablist"
            aria-label="Transformation stories"
          >
            {CARDS.map((_, i) => (
              <motion.button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === cardIndex}
                aria-label={`Go to story ${i + 1}`}
                className={cn(
                  'h-2 rounded-full transition-colors',
                  i === cardIndex ? 'w-8 bg-primary' : 'w-2 bg-white/25',
                )}
                onClick={() => {
                  setCardIndex(i)
                  setIsProfessional(false)
                  setShowBridgeGlow(false)
                }}
                whileTap={{ scale: 0.92 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
