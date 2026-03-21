'use client'

import { motion } from 'framer-motion'
import { HorizontalIntelligencePillars } from './HorizontalIntelligencePillars'
import { LearningDimensionsBackground } from './LearningDimensionsBackground'
import { VerticalMasteryTracks } from './VerticalMasteryTracks'

export default function LearningDimensions() {
  return (
    <section className="relative isolate overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <LearningDimensionsBackground />
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex justify-center items-center text-center"
      >
        <div className="text-sm text-primary font-medium flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-full">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          Learning Dimensions
        </div>
      </motion.div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="relative grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20 xl:gap-24">
          <div
            className="pointer-events-none absolute left-1/2 top-24 hidden h-[calc(100%-8rem)] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-indigo-200/60 to-transparent lg:block"
            aria-hidden
          />

          <div className="relative min-w-0">
            <VerticalMasteryTracks />
          </div>

          <div className="relative min-w-0">
            <HorizontalIntelligencePillars />
          </div>
        </div>

        <p className="mx-auto mt-4 max-w-5xl text-center text-lg text-gray-700">
          Depth builds expertise. Breadth builds adaptability. Together, they
          create exceptional professionals.
        </p>
      </div>
    </section>
  )
}
