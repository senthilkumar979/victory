import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { InterviewPrepQuestionJumpList } from './InterviewPrepQuestionJumpList'

const scrollIntoView = vi.fn()

beforeEach(() => {
  scrollIntoView.mockReset()
  Element.prototype.scrollIntoView = scrollIntoView
})

afterEach(() => {
  cleanup()
})

describe('InterviewPrepQuestionJumpList', () => {
  it('renders nothing when there are no questions', () => {
    const onJump = vi.fn()

    const { container } = render(
      <InterviewPrepQuestionJumpList
        total={0}
        currentIndex={0}
        onJump={onJump}
      />,
    )

    expect(container).toBeEmptyDOMElement()
    expect(scrollIntoView).not.toHaveBeenCalled()
    expect(onJump).not.toHaveBeenCalled()
  })

  it('jumps with a zero-based index and scrolls the active question into view', () => {
    const onJump = vi.fn()
    const { rerender } = render(
      <InterviewPrepQuestionJumpList
        total={3}
        currentIndex={1}
        onJump={onJump}
      />,
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
    expect(buttons[1]).toHaveAttribute('aria-current', 'true')
    expect(buttons[0]).not.toHaveAttribute('aria-current')
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Go to question 3' }))
    expect(onJump).toHaveBeenCalledWith(2)

    scrollIntoView.mockClear()
    rerender(
      <InterviewPrepQuestionJumpList
        total={3}
        currentIndex={2}
        onJump={onJump}
      />,
    )
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
  })

  it('does not mark a question current when the index is out of range', () => {
    render(
      <InterviewPrepQuestionJumpList
        total={3}
        currentIndex={5}
        onJump={vi.fn()}
      />,
    )

    expect(screen.getAllByRole('button')).toHaveLength(3)
    expect(screen.queryByRole('button', { current: true })).not.toBeInTheDocument()
    expect(scrollIntoView).not.toHaveBeenCalled()
  })
})
