import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { InterviewPrepPracticeRow } from './InterviewPrepPracticeRow'

const progressSpy = vi.hoisted(() => vi.fn())

vi.mock('./InterviewPrepProgress', () => ({
  InterviewPrepProgress: (props: {
    index: number
    total: number
    progressPct: number
  }) => {
    progressSpy(props)
    return <p>{`progress ${props.progressPct}`}</p>
  },
}))

vi.mock('./InterviewPrepDeck', () => ({
  InterviewPrepDeck: () => <p>deck</p>,
}))

const renderRow = (total: number, currentIndex: number) =>
  render(
    <InterviewPrepPracticeRow
      trackSlug="javascript"
      total={total}
      currentIndex={currentIndex}
      goToQuestion={vi.fn()}
      showAnswer={false}
      onToggleAnswer={vi.fn()}
    />,
  )

afterEach(() => {
  cleanup()
  progressSpy.mockClear()
})

describe('InterviewPrepPracticeRow', () => {
  it('reports 0% when the track has no questions', () => {
    renderRow(0, 0)

    expect(screen.getByText('progress 0')).toBeInTheDocument()
    expect(progressSpy).toHaveBeenCalledWith(
      expect.objectContaining({ index: 0, total: 0, progressPct: 0 }),
    )
  })

  it('counts the current question toward a finite percentage', () => {
    renderRow(4, 1)

    expect(screen.getByText('progress 50')).toBeInTheDocument()
    expect(progressSpy).toHaveBeenCalledWith(
      expect.objectContaining({ index: 1, total: 4, progressPct: 50 }),
    )
  })

  it('reaches 100% on the last question', () => {
    renderRow(3, 2)

    expect(screen.getByText('progress 100')).toBeInTheDocument()
  })
})
