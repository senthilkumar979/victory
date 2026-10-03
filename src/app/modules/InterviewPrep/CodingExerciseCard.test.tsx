import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import type { CodingExercise } from '@/data/interview-prep'

import { CodingExerciseCard } from './CodingExerciseCard'

function makeExercise(overrides: Partial<CodingExercise> = {}): CodingExercise {
  return {
    id: 'cart-total',
    difficulty: 'beginner',
    title: 'Cart totals',
    scenario: 'Sum the line items.',
    constraints: ['Do not mutate the cart'],
    hints: ['Use reduce', 'Start from zero'],
    answerFiles: [
      { path: 'cart.js', language: 'javascript', code: 'export const total = 1' },
      {
        path: 'cart.test.js',
        language: 'javascript',
        code: 'expect(total).toBe(1)',
      },
    ],
    ...overrides,
  }
}

describe('CodingExerciseCard', () => {
  afterEach(() => {
    cleanup()
  })

  it('reveals hints one at a time and stops at the last hint', async () => {
    const user = userEvent.setup()
    render(<CodingExerciseCard exercise={makeExercise()} />)

    expect(screen.getByText('Beginner')).toBeInTheDocument()
    expect(screen.getByText('Do not mutate the cart')).toBeInTheDocument()
    expect(screen.queryByText('Use reduce')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset hints' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Show a hint' }))
    expect(screen.getByText('Use reduce')).toBeInTheDocument()
    expect(screen.queryByText('Start from zero')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Show next hint' }))
    expect(screen.getByText('Start from zero')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All hints shown' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Reset hints' }))
    expect(screen.queryByText('Use reduce')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show a hint' })).toBeEnabled()
  })

  it('hides constraints and disables hints when none exist', () => {
    render(
      <CodingExerciseCard
        exercise={makeExercise({
          difficulty: 'mid',
          constraints: [],
          hints: [],
        })}
      />,
    )

    expect(screen.getByText('Mid-level')).toBeInTheDocument()
    expect(screen.queryByText('Do not mutate the cart')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All hints shown' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Reset hints' })).toBeDisabled()
  })

  it('keeps the reference solution hidden until opened and switches files', async () => {
    const user = userEvent.setup()
    render(<CodingExerciseCard exercise={makeExercise()} />)

    expect(screen.queryByText('export const total = 1')).not.toBeInTheDocument()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /reveal reference solution/i }),
    )

    expect(screen.getByText('export const total = 1')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'cart.js' })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    await user.click(screen.getByRole('tab', { name: 'cart.test.js' }))
    expect(screen.getByText('expect(total).toBe(1)')).toBeInTheDocument()
    expect(screen.queryByText('export const total = 1')).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /hide reference solution/i }),
    )
    expect(screen.queryByText('expect(total).toBe(1)')).not.toBeInTheDocument()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
  })

  it('skips file tabs when there is a single answer file', async () => {
    const user = userEvent.setup()
    render(
      <CodingExerciseCard
        exercise={makeExercise({
          answerFiles: [
            { path: 'only.js', language: 'javascript', code: 'const only = true' },
          ],
        })}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: /reveal reference solution/i }),
    )

    expect(screen.getByText('const only = true')).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })
})
