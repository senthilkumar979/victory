import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { DueStatusChip, SubmissionStatusChip } from './AssignmentStatusChips'

describe('assignment status chips', () => {
  afterEach(() => {
    cleanup()
  })

  it('labels each due state', () => {
    const { rerender } = render(<DueStatusChip status="upcoming" />)
    expect(screen.getByText('Upcoming')).toBeInTheDocument()

    rerender(<DueStatusChip status="due_soon" />)
    expect(screen.getByText('Due soon')).toBeInTheDocument()
    expect(screen.queryByText('Upcoming')).not.toBeInTheDocument()

    rerender(<DueStatusChip status="past_due" />)
    expect(screen.getByText('Past due')).toBeInTheDocument()
  })

  it('distinguishes submitted work from work still open', () => {
    const { rerender } = render(<SubmissionStatusChip submitted />)
    expect(screen.getByText('Submitted')).toBeInTheDocument()

    rerender(<SubmissionStatusChip submitted={false} />)
    expect(screen.getByText('Not submitted')).toBeInTheDocument()
    expect(screen.queryByText('Submitted')).not.toBeInTheDocument()
  })
})
