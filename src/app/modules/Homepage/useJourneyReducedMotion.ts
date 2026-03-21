'use client'

import { useReducedMotion } from 'motion/react'

export function useJourneyReducedMotion(): boolean {
  return useReducedMotion() ?? false
}
