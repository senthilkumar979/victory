'use client'

import { InterviewPrepDeck } from './InterviewPrepDeck'
import { InterviewPrepProgress } from './InterviewPrepProgress'

export interface InterviewPrepPracticeRowProps {
  trackSlug: string
  total: number
  currentIndex: number
  goToQuestion: (index: number) => void
  showAnswer: boolean
  onToggleAnswer: () => void
}

export const InterviewPrepPracticeRow = ({
  trackSlug,
  total,
  currentIndex,
  goToQuestion,
  showAnswer,
  onToggleAnswer,
}: InterviewPrepPracticeRowProps) => (
  <div className="mt-6 flex flex-col gap-6 lg:gap-8 w-full">
    <div className="min-w-0 flex-1">
      <InterviewPrepProgress
        index={currentIndex}
        total={total}
        progressPct={total > 0 ? ((currentIndex + 1) / total) * 100 : 0}
        progressBarClass="bg-primary"
      />
      <InterviewPrepDeck
        trackSlug={trackSlug}
        questionIndex={currentIndex}
        goToQuestion={goToQuestion}
        showAnswer={showAnswer}
        onToggleAnswer={onToggleAnswer}
      />
    </div>
  </div>
)
