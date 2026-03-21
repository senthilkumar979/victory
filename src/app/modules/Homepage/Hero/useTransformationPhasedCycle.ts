'use client'

import { useEffect, useState } from 'react'
import { CARDS } from './data'
import type { JourneyPhase } from './Hero.types'
import {
  PHASE_BRIDGE_MS,
  PHASE_CYCLE_MS,
  PHASE_STUDENT_MS,
} from './transformationMobileTiming'

export function useTransformationPhasedCycle() {
  const [cardIndex, setCardIndex] = useState(0)
  const [phase, setPhase] = useState<JourneyPhase>(1)

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

  return {
    cardIndex,
    phase,
    currentCard: CARDS[cardIndex],
  }
}
