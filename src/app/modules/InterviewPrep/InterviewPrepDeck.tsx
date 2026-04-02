'use client'

import { Button } from '@/components/ui/button'
import { getInterviewTrack } from '@/data/interview-prep'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback } from 'react'
import { InterviewPrepQuestionCard } from './InterviewPrepQuestionCard'

export interface InterviewPrepDeckProps {
  trackSlug: string
  questionIndex: number
  goToQuestion: (index: number) => void
  showAnswer: boolean
  onToggleAnswer: () => void
}

export const InterviewPrepDeck = ({
  trackSlug,
  questionIndex,
  goToQuestion,
  showAnswer,
  onToggleAnswer,
}: InterviewPrepDeckProps) => {
  const track = getInterviewTrack(trackSlug)
  const questions = track?.questions ?? []
  const total = questions.length
  const current = questions[questionIndex]

  const goPrev = useCallback(() => {
    goToQuestion(questionIndex - 1)
  }, [goToQuestion, questionIndex])

  const goNext = useCallback(() => {
    goToQuestion(questionIndex + 1)
  }, [goToQuestion, questionIndex])

  if (!track || !current) return null

  return (
    <div className="mx-auto w-full max-w-2xl px-1 pb-8 pt-2 sm:px-4">
      <div
        id="interview-prep-card-anchor"
        className="relative flex min-h-[360px] w-full scroll-mt-24 justify-center px-0 sm:min-h-[380px] sm:scroll-mt-28"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            role="group"
            aria-label={`Question ${questionIndex + 1} of ${total}`}
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.985 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full justify-center"
          >
            <InterviewPrepQuestionCard
              item={current}
              questionNumber={questionIndex + 1}
              totalQuestions={total}
              trackSlug={trackSlug}
              onSwipeLeft={goPrev}
              onSwipeRight={goNext}
              isAnswerVisible={showAnswer}
              onToggleAnswer={onToggleAnswer}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-10 flex w-full gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-12 flex-1 border-white/15 bg-white py-2 text-secondary hover:bg-white/[0.06]"
          onClick={goPrev}
          disabled={questionIndex === 0}
        >
          <ChevronLeft className="size-5" />
          Previous
        </Button>
        <Button
          type="button"
          size="lg"
          className="h-12 flex-1 bg-primary py-2 font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
          onClick={goNext}
          disabled={questionIndex >= total - 1}
        >
          Next
          <ChevronRight className="size-5" />
        </Button>
      </div>
    </div>
  )
}
