'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Brain, type LucideIcon, Server } from 'lucide-react'

interface LearningBlockProps {
  title: string
  description: string
  Icon: LucideIcon
  index: number
  tone: 'blue' | 'violet'
}

const LearningBlock = ({ title, description, Icon, index, tone }: LearningBlockProps) => {
  const reduceMotion = useReducedMotion()
  const isBlue = tone === 'blue'
  const baseRing = isBlue
    ? 'hover:shadow-[0_0_0_1px_rgba(59,130,246,0.35),0_20px_40px_-12px_rgba(37,99,235,0.18)]'
    : 'hover:shadow-[0_0_0_1px_rgba(139,92,246,0.35),0_20px_40px_-12px_rgba(109,40,217,0.18)]'

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: reduceMotion ? 0 : 0.22 + index * 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              scale: 1.05,
              transition: { type: 'spring', stiffness: 420, damping: 28 },
            }
      }
      className={[
        'group relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-shadow duration-300',
        isBlue
          ? 'border-blue-200/80 bg-gradient-to-br from-sky-50/95 via-blue-50/80 to-indigo-50/40'
          : 'border-violet-200/80 bg-gradient-to-br from-violet-50/95 via-indigo-50/70 to-fuchsia-50/35',
        'hover:shadow-lg',
        baseRing,
      ].join(' ')}
    >
      <div className="flex items-start gap-4">
        <span
          className={[
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-sm',
            isBlue
              ? 'border-blue-200/90 bg-white/80 text-indigo-600'
              : 'border-violet-200/90 bg-white/80 text-violet-700',
          ].join(' ')}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 space-y-2">
          <h3 className="text-lg font-semibold tracking-tight text-gray-900">{title}</h3>
          <p className="text-sm leading-relaxed text-gray-600">{description}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function FrameworkExplanation() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-full min-h-0 w-full flex-col justify-center py-8 lg:py-0"
    >
      <div className="mx-auto w-full max-w-xl space-y-6 lg:mx-0">
        <p className="mb-14 font-mono text-[11px] font-medium uppercase tracking-[0.35em] bg-primary w-fit p-2 text-white rounded-full">
            Learning Framework
        </p>

        <div>
          <h2 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
            Building{' '}
            <span className="bg-gradient-to-r from-pink-800 via-pink-500 to-primary bg-clip-text text-transparent">
              T-Shaped
            </span>{' '}
            Professionals
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            MentorBridge combines deep technical expertise with broad professional skills to create engineers who are
            not only capable of building systems but also thriving in real-world environments.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <LearningBlock
            index={0}
            tone="blue"
            Icon={Server}
            title="Vertical Mastery"
            description="Focused, deep learning in a specific technology stack such as MERN or Java Backend. Students gain strong technical foundations, build real-world projects, and understand how systems work internally."
          />
          <LearningBlock
            index={1}
            tone="violet"
            Icon={Brain}
            title="Horizontal Intelligence"
            description="Development of essential professional skills including communication, career awareness, financial literacy, and problem-solving — enabling students to grow effectively within organizations."
          />
        </div>

        <p className="mt-6 text-base font-medium leading-relaxed text-gray-700">
          The intersection of these two dimensions creates professionals who are{' '}
          <strong className="font-semibold text-gray-900">both technically strong</strong> and{' '}
          <strong className="font-semibold text-gray-900">strategically capable</strong>.
        </p>
      </div>
      </motion.div>
  )
}
