import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { InterviewQuestion } from '@/data/interview-prep'

import { InterviewPrepQuestionCard } from './InterviewPrepQuestionCard'

const motionX = vi.hoisted(() => ({ set: vi.fn() }))

vi.mock('framer-motion', () => ({
  animate: vi.fn(),
  useMotionValue: () => motionX,
  useReducedMotion: () => false,
  useTransform: () => 0,
  motion: {
    article: 'article',
    div: 'div',
  },
}))

afterEach(() => {
  cleanup()
  motionX.set.mockClear()
})

function question(
  overrides: Partial<InterviewQuestion> = {},
): InterviewQuestion {
  return {
    id: 'q1',
    question: 'What is a closure?',
    answer: 'A function that remembers its scope.',
    codeExample: 'const value = 1',
    codeLanguage: 'javascript',
    ...overrides,
  }
}

function renderCard(
  item: InterviewQuestion,
  isAnswerVisible = false,
  onToggleAnswer = vi.fn(),
) {
  return render(
    <InterviewPrepQuestionCard
      item={item}
      questionNumber={3}
      totalQuestions={12}
      trackSlug="javascript"
      onSwipeLeft={vi.fn()}
      onSwipeRight={vi.fn()}
      isAnswerVisible={isAnswerVisible}
      onToggleAnswer={onToggleAnswer}
    />,
  )
}

describe('InterviewPrepQuestionCard', () => {
  it('pads the question index and hides the answer until it is revealed', () => {
    const onToggleAnswer = vi.fn()
    renderCard(question(), false, onToggleAnswer)

    expect(screen.getByText('03 / 12')).toBeInTheDocument()
    expect(screen.getByText('What is a closure?')).toBeInTheDocument()
    expect(
      screen.queryByText('A function that remembers its scope.'),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('const value = 1')).not.toBeInTheDocument()
    expect(motionX.set).toHaveBeenCalledWith(0)

    fireEvent.click(screen.getByRole('button', { name: /Reveal\s+answer/ }))
    expect(onToggleAnswer).toHaveBeenCalledTimes(1)
  })

  it('shows the answer and code sample only while the answer is visible', () => {
    const { rerender } = renderCard(question(), true)

    expect(screen.getByText('A function that remembers its scope.')).toBeInTheDocument()
    expect(screen.getByText('const value = 1')).toBeInTheDocument()
    expect(screen.getByText('javascript')).toBeInTheDocument()

    rerender(
      <InterviewPrepQuestionCard
        item={question({ codeExample: undefined, codeLanguage: undefined })}
        questionNumber={3}
        totalQuestions={12}
        trackSlug="javascript"
        onSwipeLeft={vi.fn()}
        onSwipeRight={vi.fn()}
        isAnswerVisible
        onToggleAnswer={vi.fn()}
      />,
    )

    expect(
      screen.getByText('A function that remembers its scope.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('const value = 1')).not.toBeInTheDocument()
    expect(screen.queryByText('javascript')).not.toBeInTheDocument()
  })

  it('resets the card position when the question changes', () => {
    const { rerender } = renderCard(question())
    expect(motionX.set).toHaveBeenCalledTimes(1)

    rerender(
      <InterviewPrepQuestionCard
        item={question({ id: 'q2', question: 'Next question' })}
        questionNumber={4}
        totalQuestions={12}
        trackSlug="javascript"
        onSwipeLeft={vi.fn()}
        onSwipeRight={vi.fn()}
        isAnswerVisible={false}
        onToggleAnswer={vi.fn()}
      />,
    )

    expect(motionX.set).toHaveBeenCalledTimes(2)
    expect(screen.getByText('04 / 12')).toBeInTheDocument()
  })
})
