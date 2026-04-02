'use client'

import { Button } from '@/components/ui/button'
import { getInterviewTrack } from '@/data/interview-prep'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useState } from 'react'
import { InterviewPrepProgress } from './InterviewPrepProgress'
import { InterviewPrepQuestionCard } from './InterviewPrepQuestionCard'
import { useInterviewPrepKeyboard } from './useInterviewPrepKeyboard'

interface InterviewPrepDeckProps {
  trackSlug: string
}

export const InterviewPrepDeck = ({ trackSlug }: InterviewPrepDeckProps) => {
  const track = getInterviewTrack(trackSlug)
  const questions = track?.questions ?? []
  const [index, setIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  const total = questions.length
  const current = questions[index]
  const progressPct = total > 0 ? ((index + 1) / total) * 100 : 0

  const progressBarClass = track?.accent
    ? track.accent.replace('text-', 'bg-')
    : 'bg-primary'

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1))
    setShowAnswer(false)
  }, [setIndex, setShowAnswer])

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(total - 1, i + 1))
    setShowAnswer(false)
  }, [setIndex, setShowAnswer, total])

  const toggleAnswer = useCallback(() => {
    setShowAnswer((s) => !s)
  }, [setShowAnswer])

  useInterviewPrepKeyboard(goNext, goPrev, toggleAnswer)

  if (!track || !current) return null

  return (
    <div className="mx-auto w-full max-w-2xl px-1 pb-8 pt-2 sm:px-4">
      <InterviewPrepProgress
        index={index}
        total={total}
        progressPct={progressPct}
        progressBarClass={progressBarClass}
      />

      <div className="relative flex min-h-[360px] w-full justify-center px-0 sm:min-h-[380px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            role="group"
            aria-label={`Question ${index + 1} of ${total}`}
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.985 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full justify-center"
          >
            <InterviewPrepQuestionCard
              item={current}
              questionNumber={index + 1}
              totalQuestions={total}
              trackSlug={trackSlug}
              onSwipeLeft={goPrev}
              onSwipeRight={goNext}
              isAnswerVisible={showAnswer}
              onToggleAnswer={toggleAnswer}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-10 flex w-full gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-12 py-2 flex-1 border-white/15 bg-white text-secondary hover:bg-white/[0.06]"
          onClick={goPrev}
          disabled={index === 0}
        >
          <ChevronLeft className="size-5" />
          Previous
        </Button>
        <Button
          type="button"
          size="lg"
          className="h-12 py-2 flex-1 bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
          onClick={goNext}
          disabled={index >= total - 1}
        >
          Next
          <ChevronRight className="size-5" />
        </Button>
      </div>
    </div>
  )
}
