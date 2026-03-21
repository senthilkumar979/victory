'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { verticalSteps } from './learningDimensionsContent'
import { VerticalDesktopPipeline } from './VerticalDesktopPipeline'
import { verticalIconMap } from './verticalMasteryIcons'
import { nodePulse, stepContainer, stepItem } from './verticalMasteryMotion'

export const VerticalMasteryTracks = () => {
  const reduceMotion = useReducedMotion()

  return (
    <div className="relative min-h-0">
      <header className="relative z-10 mb-10 max-w-xl">
        <h2 className="text-3xl font-bold text-gray-900">
          Vertical Mastery Tracks
        </h2>
        <p className="mt-2 text-gray-600">
          Deep expertise in modern technology stacks
        </p>
      </header>

      <div className="relative z-10 lg:pl-2 lg:pr-4">
        <VerticalDesktopPipeline reduceMotion={!!reduceMotion} />

        <motion.div
          className="relative z-10 space-y-5 lg:hidden"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={stepContainer}
        >
          {verticalSteps.map((step, index) => {
            const Icon = verticalIconMap[step.icon]
            return (
              <motion.div key={step.id} variants={stepItem(!!reduceMotion)}>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center pt-1">
                    <motion.div
                      className="h-3 w-3 rounded-full border-2 border-white bg-gradient-to-br from-sky-400 to-indigo-600 shadow"
                      variants={nodePulse(!!reduceMotion)}
                    />
                    {index < verticalSteps.length - 1 ? (
                      <div className="mt-1 min-h-[2rem] w-px flex-1 bg-gradient-to-b from-blue-300/80 to-indigo-200/40" />
                    ) : null}
                  </div>
                  <motion.div
                    className="min-w-0 flex-1 rounded-xl border border-slate-200/90 bg-white/80 p-5 shadow-md backdrop-blur-md"
                    whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                  >
                    <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-primary/80">
                      <Icon className="h-4 w-4 text-primary" aria-hidden />
                      {step.title}
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700">
                      {step.description}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
