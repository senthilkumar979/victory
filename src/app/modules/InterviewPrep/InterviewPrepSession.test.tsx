import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { InterviewPrepSession } from './InterviewPrepSession'

const getInterviewTrackMock = vi.hoisted(() => vi.fn())

vi.mock('@/data/interview-prep', () => ({
  getInterviewTrack: (...args: unknown[]) => getInterviewTrackMock(...args),
}))

vi.mock('./InterviewPrepPracticeRow', () => ({
  InterviewPrepPracticeRow: ({
    currentIndex,
    showAnswer,
    onToggleAnswer,
  }: {
    currentIndex: number
    showAnswer: boolean
    onToggleAnswer: () => void
  }) => (
    <div>
      <p>Question {currentIndex + 1}</p>
      <p>{showAnswer ? 'Answer visible' : 'Answer hidden'}</p>
      <button type="button" onClick={onToggleAnswer}>
        Toggle answer
      </button>
    </div>
  ),
}))

function mockTrack(questionCount: number) {
  getInterviewTrackMock.mockReturnValue({
    slug: 'javascript',
    title: 'JavaScript',
    description: '',
    accent: '',
    gradient: '',
    icon: () => null,
    questions: Array.from({ length: questionCount }, (_, i) => ({
      id: `q-${i}`,
      question: `Q${i + 1}`,
      answer: `A${i + 1}`,
    })),
  })
}

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  cleanup()
  getInterviewTrackMock.mockReset()
})

describe('InterviewPrepSession', () => {
  it('renders nothing for an unknown track or empty question list', () => {
    getInterviewTrackMock.mockReturnValue(undefined)
    const { rerender, container } = render(
      <InterviewPrepSession trackSlug="missing" />,
    )
    expect(container).toBeEmptyDOMElement()

    getInterviewTrackMock.mockReturnValue({
      slug: 'javascript',
      questions: [],
    })
    rerender(<InterviewPrepSession trackSlug="javascript" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('clamps jumps and hides the answer when changing questions', async () => {
    const user = userEvent.setup()
    mockTrack(3)
    render(<InterviewPrepSession trackSlug="javascript" />)

    expect(screen.getByText('Question 1')).toBeInTheDocument()
    expect(screen.getByText('Answer hidden')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Toggle answer' }))
    expect(screen.getByText('Answer visible')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Go to question 3' }))
    expect(screen.getByText('Question 3')).toBeInTheDocument()
    expect(screen.getByText('Answer hidden')).toBeInTheDocument()
  })
})
