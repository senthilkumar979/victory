import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { InterviewPrepNavTabs } from './InterviewPrepNavTabs'

afterEach(() => {
  cleanup()
})

describe('InterviewPrepNavTabs', () => {
  it('keeps only the selected section in the tab sequence', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <InterviewPrepNavTabs value="questions" onChange={onChange} />,
    )

    const questions = screen.getByRole('tab', { name: /Questions/ })
    const exercises = screen.getByRole('tab', { name: /Exercises/ })

    expect(screen.getByRole('tablist', { name: 'Interview prep sections' })).toBeInTheDocument()
    expect(questions).toHaveAttribute('aria-selected', 'true')
    expect(questions).toHaveAttribute('tabindex', '0')
    expect(questions).toHaveAttribute('aria-controls', 'interview-prep-panel-questions')
    expect(exercises).toHaveAttribute('aria-selected', 'false')
    expect(exercises).toHaveAttribute('tabindex', '-1')

    fireEvent.click(exercises)
    expect(onChange).toHaveBeenCalledWith('coding')

    rerender(<InterviewPrepNavTabs value="coding" onChange={onChange} />)

    expect(screen.getByRole('tab', { name: /Exercises/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: /Exercises/ })).toHaveAttribute(
      'tabindex',
      '0',
    )
    expect(screen.getByRole('tab', { name: /Questions/ })).toHaveAttribute(
      'tabindex',
      '-1',
    )
  })
})
