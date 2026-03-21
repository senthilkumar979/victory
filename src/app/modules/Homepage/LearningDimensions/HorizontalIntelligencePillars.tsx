'use client'

import type { Variants } from 'framer-motion'
import { motion, useReducedMotion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { horizontalPillars } from './learningDimensionsContent'

const gridContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
}

const cardVariants = (reduce: boolean): Variants => ({
  hidden: { opacity: 0, scale: reduce ? 1 : 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
})

const floatLoop = (reduce: boolean) =>
  reduce
    ? false
    : {
        y: [0, -5, 0],
        transition: {
          duration: 5.5,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        },
      }

export const HorizontalIntelligencePillars = () => {
  const reduceMotion = useReducedMotion()

  return (
    <div className="relative min-h-0">
      <header className="relative z-10 mb-10 max-w-xl lg:ml-auto lg:text-right">
        <div className="inline-flex items-center gap-2 lg:flex-row-reverse">
          <Sparkles
            className="hidden h-6 w-6 text-pink-500/90 sm:block"
            aria-hidden
          />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Horizontal Intelligence Pillars
            </h2>
            <p className="mt-2 text-gray-600 lg:ml-auto lg:max-w-md">
              Skills that expand professional capability
            </p>
          </div>
        </div>
      </header>

      <div className="relative">
        <svg
          className="pointer-events-none absolute inset-0 -z-0 hidden h-full w-full text-indigo-300/35 md:block"
          aria-hidden
          viewBox="0 0 400 320"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M 40 40 Q 120 90 200 120 T 360 200"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="4 8"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.path
            d="M 80 200 Q 180 140 260 180 T 340 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 7"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.7 }}
            viewport={{ once: true }}
            transition={{
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.15,
            }}
          />
        </svg>

        <div className="pointer-events-none absolute -left-2 top-1/4 h-2 w-2 rounded-full bg-pink-400/50 blur-[1px] md:left-4" />
        <div className="pointer-events-none absolute bottom-10 right-8 h-2 w-2 rounded-full bg-indigo-400/50 blur-[1px]" />
        <div className="pointer-events-none absolute right-1/4 top-12 h-1.5 w-1.5 rounded-full bg-fuchsia-400/45" />
        <div className="pointer-events-none absolute left-1/4 bottom-10 h-2 w-2 rounded-full bg-indigo-400/50 blur-[1px]" />
        <div className="pointer-events-none absolute right-1/4 top-12 h-1.5 w-1.5 rounded-full bg-fuchsia-400/45" />
        <div className="pointer-events-none absolute left-1/4 bottom-10 h-2 w-2 rounded-full bg-indigo-400/50 blur-[1px]" />

        <motion.ul
          className="relative z-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={gridContainer}
        >
          {horizontalPillars.map((pillar, index) => {
            const tilt =
              index % 3 === 0
                ? 'rotate-1'
                : index % 3 === 1
                ? '-rotate-1'
                : 'rotate-0'
            return (
              <motion.li
                key={pillar.id}
                className={`relative list-none ${tilt}`}
                variants={cardVariants(!!reduceMotion)}
                animate={floatLoop(!!reduceMotion)}
              >
                <motion.div
                  className="rounded-2xl border border-gray-200 bg-white/70 p-5 shadow-lg shadow-slate-900/5 backdrop-blur-md transition-shadow duration-300 ease-in-out hover:ring-2 hover:ring-indigo-400/30"
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          scale: 1.05,
                          boxShadow: '0 0 28px 2px rgba(212, 59, 246, 0.28)',
                        }
                  }
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h3 className="text-base font-semibold text-primary">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {pillar.description}
                  </p>
                </motion.div>
              </motion.li>
            )
          })}
        </motion.ul>
      </div>
    </div>
  )
}
