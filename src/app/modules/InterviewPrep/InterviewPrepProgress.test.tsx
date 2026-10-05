import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { InterviewPrepProgress } from './InterviewPrepProgress'

function barWidth(container: HTMLElement): string {
  const fill = container.querySelector('.bg-primary')
  if (!(fill instanceof HTMLElement)) return ''
  return fill.style.width
}

afterEach(() => {
  cleanup()
})

describe('InterviewPrepProgress', () => {
  it('shows a 1-based index and clamps the bar at 100 percent', () => {
    const { container } = render(
      <InterviewPrepProgress
        index={2}
        total={10}
        progressPct={140}
        progressBarClass="bg-primary"
      />,
    )

    const bar = screen.getByRole('progressbar', { name: 'Question 3 of 10' })
    expect(bar).toHaveAttribute('aria-valuenow', '3')
    expect(bar).toHaveAttribute('aria-valuemin', '1')
    expect(bar).toHaveAttribute('aria-valuemax', '10')
    expect(barWidth(container)).toBe('100%')
  })

  it('uses a zero width when there are no questions or the percent is negative', () => {
    const { container, rerender } = render(
      <InterviewPrepProgress
        index={0}
        total={0}
        progressPct={50}
        progressBarClass="bg-primary"
      />,
    )

    expect(barWidth(container)).toBe('0%')
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '0')

    rerender(
      <InterviewPrepProgress
        index={0}
        total={4}
        progressPct={-20}
        progressBarClass="bg-primary"
      />,
    )

    expect(barWidth(container)).toBe('0%')
  })
})
