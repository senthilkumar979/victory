import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { CodingExercise } from '@/data/interview-prep'

import { CodingExercisesSection } from './CodingExercisesSection'

vi.mock('./CodingExerciseCard', () => ({
  CodingExerciseCard: function CodingExerciseCard({
    exercise,
  }: {
    exercise: CodingExercise
  }) {
    return <article>{exercise.title}</article>
  },
}))

afterEach(() => {
  cleanup()
})

function exercise(id: string, title: string): CodingExercise {
  return {
    id,
    difficulty: 'beginner',
    title,
    scenario: 'Build the feature',
    hints: [],
    answerFiles: [],
  }
}

describe('CodingExercisesSection', () => {
  it('names the track when no exercises are published', () => {
    render(
      <CodingExercisesSection trackTitle="Core Java" exercises={[]} />,
    )

    expect(
      screen.getByRole('heading', { name: 'Exercises coming soon' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Core Java')).toBeInTheDocument()
    expect(screen.queryByText('Coding exercises')).not.toBeInTheDocument()
    expect(screen.queryByText('scenarios')).not.toBeInTheDocument()
  })

  it('shows the exercise count and one card per scenario', () => {
    render(
      <CodingExercisesSection
        trackTitle="JavaScript"
        exercises={[exercise('cart', 'Cart totals'), exercise('wait', 'Debounce')]}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Coding exercises' }),
    ).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('scenarios')).toBeInTheDocument()
    expect(screen.getByText('Cart totals')).toBeInTheDocument()
    expect(screen.getByText('Debounce')).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Exercises coming soon' }),
    ).not.toBeInTheDocument()
  })
})
