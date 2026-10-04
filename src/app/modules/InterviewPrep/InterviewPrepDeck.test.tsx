import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { HTMLAttributes, ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { getInterviewTrack } from '@/data/interview-prep'

import { InterviewPrepDeck } from './InterviewPrepDeck'

vi.mock('framer-motion', () => {
  const MotionDiv = ({
    children,
    ...props
  }: HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>

  return {
    AnimatePresence: ({ children }: { children: ReactNode }) => children,
    motion: { div: MotionDiv },
  }
})

vi.mock('./InterviewPrepQuestionCard', () => ({
  InterviewPrepQuestionCard: function InterviewPrepQuestionCard({
    questionNumber,
    totalQuestions,
    item,
  }: {
    questionNumber: number
    totalQuestions: number
    item: { question: string }
  }) {
    return (
      <article>
        <p>{`${questionNumber} / ${totalQuestions}`}</p>
        <h2>{item.question}</h2>
      </article>
    )
  },
}))

const track = getInterviewTrack('javascript')
if (!track || track.questions.length < 2) {
  throw new Error('javascript interview track is required for deck bounds')
}

const lastIndex = track.questions.length - 1

afterEach(() => {
  cleanup()
})

describe('InterviewPrepDeck', () => {
  it('renders nothing for a roadmap slug or an index past the last question', () => {
    const { rerender } = render(
      <InterviewPrepDeck
        trackSlug="java"
        questionIndex={0}
        goToQuestion={vi.fn()}
        showAnswer={false}
        onToggleAnswer={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument()

    rerender(
      <InterviewPrepDeck
        trackSlug="javascript"
        questionIndex={track.questions.length}
        goToQuestion={vi.fn()}
        showAnswer={false}
        onToggleAnswer={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
  })

  it('disables the out-of-range control and steps only through valid neighbors', async () => {
    const user = userEvent.setup()
    const goToQuestion = vi.fn()
    const { rerender } = render(
      <InterviewPrepDeck
        trackSlug="javascript"
        questionIndex={0}
        goToQuestion={goToQuestion}
        showAnswer={false}
        onToggleAnswer={vi.fn()}
      />,
    )

    expect(screen.getByText(`1 / ${track.questions.length}`)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Previous' }))
    expect(goToQuestion).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(goToQuestion).toHaveBeenCalledWith(1)

    rerender(
      <InterviewPrepDeck
        trackSlug="javascript"
        questionIndex={lastIndex}
        goToQuestion={goToQuestion}
        showAnswer={false}
        onToggleAnswer={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(goToQuestion).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole('button', { name: 'Previous' }))
    expect(goToQuestion).toHaveBeenCalledWith(lastIndex - 1)
  })
})
