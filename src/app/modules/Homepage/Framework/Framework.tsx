'use client'

import { Variants } from 'framer-motion'
import FrameworkDiagram from './FrameworkDiagram'
import FrameworkExplanation from './FrameworkExplanation'
import { LearningDimensionsBackground } from '../LearningDimensions/LearningDimensionsBackground'
import { FrameworkBackground } from './FrameworkBackground'

export const screenVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
}

export const Framework = () => {
  return (
    <div className="relative isolate overflow-hidden flex w-full flex-col gap-12 lg:grid lg:grid-cols-2 lg:items-center lg:gap-14 xl:gap-16">
      <FrameworkBackground />
      <div className="min-h-0 w-full">
        <FrameworkDiagram />
      </div>
      <div className="min-h-0 w-full relative z-10">
        <FrameworkExplanation />
      </div>
    </div>
  )
}
