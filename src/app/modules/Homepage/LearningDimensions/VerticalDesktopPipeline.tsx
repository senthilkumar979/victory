'use client'

import { motion } from 'framer-motion'
import { verticalSteps } from './learningDimensionsContent'
import { nodePulse, stepContainer, stepItem } from './verticalMasteryMotion'
import { verticalIconMap } from './verticalMasteryIcons'

interface VerticalDesktopPipelineProps {
  reduceMotion: boolean
}

export const VerticalDesktopPipeline = ({ reduceMotion }: VerticalDesktopPipelineProps) => {
  return (
    <div className="relative hidden pb-2 lg:block">
      <div className="absolute bottom-0 left-1/2 top-0 w-[3px] -translate-x-1/2 overflow-hidden rounded-full bg-slate-200/80">
        <motion.div
          className="w-full rounded-full bg-gradient-to-b from-pink-400 via-primary to-pink-400"
          initial={{ height: 0 }}
          whileInView={{ height: '100%' }}
          viewport={{ once: true }}
          transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
          style={{ originY: 0 }}
        />
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-50 mix-blend-screen"
          animate={
            reduceMotion ? undefined : { backgroundPosition: ['0% 0%', '0% 100%', '0% 0%'] }
          }
          transition={
            reduceMotion ? undefined : { duration: 4, repeat: Infinity, ease: 'linear' }
          }
          style={{
            backgroundImage:
              'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.95) 45%, transparent 90%)',
            backgroundSize: '100% 35%',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </div>

      <motion.div
        className="relative space-y-10"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        variants={stepContainer}
      >
        {verticalSteps.map((step, index) => {
          const Icon = verticalIconMap[step.icon]
          const cardOnLeft = index % 2 === 0
          const card = (
            <div className="max-w-sm flex-1">
              <motion.div
                className="rounded-xl border border-slate-200/90 bg-white/80 p-5 shadow-md backdrop-blur-md transition-colors duration-300 ease-in-out"
                whileHover={
                  reduceMotion
                    ? undefined
                    : {
                        y: -4,
                        boxShadow: '0 0 28px 2px rgba(212, 59, 246, 0.28)',
                        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                      }
                }
              >
                <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  <Icon className="h-4 w-4 text-primary/80" aria-hidden />
                  {step.title}
                </div>
                <p className="text-sm leading-relaxed text-gray-600">{step.description}</p>
              </motion.div>
            </div>
          )

          return (
            <motion.div
              key={step.id}
              className="relative flex min-h-[4.5rem] items-center"
              variants={stepItem(reduceMotion)}
            >
              <div className="flex w-1/2 justify-end pr-8">
                {cardOnLeft ? card : <div className="max-w-sm flex-1" aria-hidden />}
              </div>

              <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  className="relative flex h-4 w-4 items-center justify-center"
                  variants={nodePulse(reduceMotion)}
                >
                  <span className="absolute h-8 w-8 rounded-full bg-pink-400/15 blur-md" />
                  <span className="relative h-3.5 w-3.5 rounded-full border-2 border-white bg-gradient-to-br from-pink-400 to-primary/70 shadow-md shadow-pink-500/30" />
                </motion.div>
              </div>

              <div className="flex w-1/2 justify-start pl-8">
                {!cardOnLeft ? card : <div className="max-w-sm flex-1" aria-hidden />}
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
