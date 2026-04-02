'use client'

import { getInterviewTrack } from '@/data/interview-prep'
import { useCallback, useState } from 'react'
import { InterviewPrepPracticeRow } from './InterviewPrepPracticeRow'
import { InterviewPrepQuestionJumpList } from './InterviewPrepQuestionJumpList'
import { useInterviewPrepKeyboard } from './useInterviewPrepKeyboard'

interface InterviewPrepSessionProps {
  trackSlug: string
}

export const InterviewPrepSession = ({
  trackSlug,
}: InterviewPrepSessionProps) => {
  const track = getInterviewTrack(trackSlug)
  const questions = track?.questions ?? []
  const total = questions.length

  const [index, setIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  const goToQuestion = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(total - 1, i))
      setIndex(next)
      setShowAnswer(false)
    },
    [total, setIndex, setShowAnswer],
  )

  const jumpToQuestion = useCallback(
    (i: number) => {
      goToQuestion(i)
      requestAnimationFrame(() => {
        document
          .getElementById('interview-prep-card-anchor')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    },
    [goToQuestion],
  )

  const goPrev = useCallback(() => goToQuestion(index - 1), [
    goToQuestion,
    index,
  ])
  const goNext = useCallback(() => goToQuestion(index + 1), [
    goToQuestion,
    index,
  ])
  const toggleAnswer = useCallback(() => {
    setShowAnswer((s) => !s)
  }, [setShowAnswer])

  useInterviewPrepKeyboard(goNext, goPrev, toggleAnswer)

  if (!track || total < 1) return null

  return (
    <div className="w-full flex gap-8 flex-col lg:flex-row lg:items-start lg:gap-8">
      <aside className="w-full shrink-0 lg:max-w-[min(100%,20rem)] lg:mt-6">
        <InterviewPrepQuestionJumpList
          total={total}
          currentIndex={index}
          onJump={jumpToQuestion}
          compact
          className="lg:sticky lg:top-28"
        />
      </aside>
      <InterviewPrepPracticeRow
        trackSlug={trackSlug}
        total={total}
        currentIndex={index}
        goToQuestion={goToQuestion}
        showAnswer={showAnswer}
        onToggleAnswer={toggleAnswer}
      />
    </div>
  )
}
