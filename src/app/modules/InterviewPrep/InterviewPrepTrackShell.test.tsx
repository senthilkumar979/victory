import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { InterviewPrepTrackShell } from './InterviewPrepTrackShell'

const sessionState = vi.hoisted(() => ({ mounts: 0 }))

vi.mock('./InterviewPrepSession', () => ({
  InterviewPrepSession: function InterviewPrepSession({ trackSlug }: { trackSlug: string }) {
    sessionState.mounts += 1
    return <div>session:{trackSlug}:{sessionState.mounts}</div>
  },
}))

vi.mock('./CodingExercisesSection', () => ({
  CodingExercisesSection: function CodingExercisesSection({
    trackTitle,
    exercises,
  }: {
    trackTitle: string
    exercises: unknown[]
  }) {
    return (
      <div>
        exercises:{trackTitle}:{exercises.length}
      </div>
    )
  },
}))

afterEach(() => {
  cleanup()
  sessionState.mounts = 0
})

describe('InterviewPrepTrackShell', () => {
  it('keeps coding exercises mounted but hidden, and remounts the question session', () => {
    render(
      <InterviewPrepTrackShell
        trackSlug="core-java"
        trackTitle="Core Java"
        codingExercises={[]}
      />,
    )

    const questions = document.getElementById('interview-prep-panel-questions')
    const coding = document.getElementById('interview-prep-panel-coding')

    expect(questions).not.toHaveAttribute('hidden')
    expect(questions).toHaveTextContent('session:core-java:1')
    expect(coding).toHaveAttribute('hidden')
    expect(coding).toHaveTextContent('exercises:Core Java:0')
    expect(screen.getByRole('tab', { name: /questions/i })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    fireEvent.click(screen.getByRole('tab', { name: /exercises/i }))

    expect(questions).toHaveAttribute('hidden')
    expect(questions).not.toHaveTextContent('session:')
    expect(coding).not.toHaveAttribute('hidden')
    expect(coding).toHaveTextContent('exercises:Core Java:0')
    expect(screen.getByRole('tab', { name: /exercises/i })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    fireEvent.click(screen.getByRole('tab', { name: /questions/i }))

    expect(questions).toHaveTextContent('session:core-java:2')
    expect(coding).toHaveAttribute('hidden')
  })
})
