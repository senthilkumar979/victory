import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import type { CodingAnswerFile } from '@/data/interview-prep'

import { CodingExerciseSolutionReveal } from './CodingExerciseSolutionReveal'

const files: CodingAnswerFile[] = [
  { path: 'src/cart.js', language: 'javascript', code: 'export const cart = 1' },
  { path: 'src/cart.test.js', language: 'javascript', code: 'expect(cart).toBe(1)' },
]

afterEach(() => {
  cleanup()
})

describe('CodingExerciseSolutionReveal', () => {
  it('keeps the reference solution hidden until the learner reveals it', async () => {
    const user = userEvent.setup()
    render(
      <CodingExerciseSolutionReveal files={[files[0]]} panelId="solution-panel" />,
    )

    expect(screen.queryByText('export const cart = 1')).not.toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Reveal reference solution/i }))
    expect(screen.getByRole('button', { name: /Hide reference solution/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(document.getElementById('solution-panel')).toHaveTextContent('export const cart = 1')
    expect(screen.queryByRole('tablist', { name: 'Solution files' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Hide reference solution/i }))
    expect(screen.queryByText('export const cart = 1')).not.toBeInTheDocument()
  })

  it('shows only the selected file when a solution has more than one file', async () => {
    const user = userEvent.setup()
    render(<CodingExerciseSolutionReveal files={files} panelId="multi-solution" />)

    await user.click(screen.getByRole('button', { name: /Reveal reference solution/i }))
    expect(screen.getByRole('tab', { name: 'src/cart.js' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByText('export const cart = 1')).toBeInTheDocument()
    expect(screen.queryByText('expect(cart).toBe(1)')).not.toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'src/cart.test.js' }))
    expect(screen.getByRole('tab', { name: 'src/cart.test.js' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByText('expect(cart).toBe(1)')).toBeInTheDocument()
    expect(screen.queryByText('export const cart = 1')).not.toBeInTheDocument()
  })
})
