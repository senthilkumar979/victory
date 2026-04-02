'use client'

import { Button } from '@/components/ui/button'
import type { InterviewQuestion } from '@/data/interview-prep'
import { cn } from '@/lib/utils'
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from 'framer-motion'
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { useEffect } from 'react'
import { InterviewPrepCodePanel } from './InterviewPrepCodePanel'
import { interviewPrepCardBar } from './interviewPrepTheme'

const SWIPE_THRESHOLD = 88

interface InterviewPrepQuestionCardProps {
  item: InterviewQuestion
  questionNumber: number
  totalQuestions: number
  trackSlug: string
  onSwipeLeft: () => void
  onSwipeRight: () => void
  isAnswerVisible: boolean
  onToggleAnswer: () => void
  className?: string
}

export const InterviewPrepQuestionCard = ({
  item,
  questionNumber,
  totalQuestions,
  trackSlug,
  onSwipeLeft,
  onSwipeRight,
  isAnswerVisible,
  onToggleAnswer,
  className,
}: InterviewPrepQuestionCardProps) => {
  const reduceMotion = useReducedMotion()
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], reduceMotion ? [0, 0] : [-8, 8])
  const barGradient = interviewPrepCardBar(trackSlug)

  useEffect(() => {
    x.set(0)
  }, [item.id, x])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (reduceMotion) return
    const dx = info.offset.x
    if (dx > SWIPE_THRESHOLD) {
      onSwipeRight()
      return
    }
    if (dx < -SWIPE_THRESHOLD) {
      onSwipeLeft()
      return
    }
    animate(x, 0, { type: 'spring', stiffness: 380, damping: 28 })
  }

  return (
    <motion.article
      style={{ x, rotate }}
      drag={reduceMotion ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.88}
      onDragEnd={onDragEnd}
      className={cn(
        'relative w-full max-w-2xl cursor-grab touch-pan-y select-none active:cursor-grabbing',
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-950/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.65)] ring-1 ring-white/[0.06] backdrop-blur-xl">
        <div
          className={cn('h-1.5 w-full bg-gradient-to-r', barGradient)}
          aria-hidden
        />

        <div className="px-6 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Interview question
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-xs tabular-nums text-zinc-300">
              {String(questionNumber).padStart(2, '0')} /{' '}
              {String(totalQuestions).padStart(2, '0')}
            </span>
          </div>

          <h2 className="mt-5 text-pretty text-xl font-semibold leading-snug tracking-tight text-zinc-50 sm:text-2xl">
            {item.question}
          </h2>

          <div className="mt-8">
            <Button
              type="button"
              variant="outline"
              className={cn(
                'group h-12 w-full justify-between border-white/15 bg-white/[0.03]',
                'text-sm font-medium text-zinc-100 transition-colors hover:bg-white/[0.06]',
              )}
              onClick={onToggleAnswer}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary opacity-90" aria-hidden />
                {isAnswerVisible ? 'Hide  answer' : 'Reveal  answer'}
              </span>
              {isAnswerVisible ? (
                <ChevronUp className="size-4 text-zinc-500" />
              ) : (
                <ChevronDown className="size-4 text-zinc-500" />
              )}
            </Button>

            {isAnswerVisible && (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="mt-5 space-y-5"
              >
                <div className="relative border-l-2 border-primary/50 pl-4">
                  <p className="text-[15px] leading-relaxed text-zinc-400">
                    {item.answer}
                  </p>
                </div>
                {item.codeExample && (
                  <InterviewPrepCodePanel
                    code={item.codeExample}
                    language={item.codeLanguage}
                  />
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}
