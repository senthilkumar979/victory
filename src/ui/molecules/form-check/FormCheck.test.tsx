import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { FormCheck } from './FormCheck'

afterEach(() => {
  cleanup()
})

describe('FormCheck', () => {
  it('derives an id from the label and describes the error before the helper', () => {
    render(
      <FormCheck
        type="checkbox"
        label="  Notify Mentors"
        helperText="Optional digest"
        errorMessage="Required for admins"
      />,
    )

    const input = screen.getByRole('checkbox', { name: 'Notify Mentors' })
    expect(input).toHaveAttribute('id', '-notify-mentors')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute(
      'aria-describedby',
      '-notify-mentors-error -notify-mentors-helper',
    )
    expect(screen.getByText('Required for admins')).toHaveAttribute(
      'id',
      '-notify-mentors-error',
    )
  })

  it('omits the error description when the field is valid and rounds radio controls', () => {
    render(
      <FormCheck
        id="cohort"
        type="radio"
        label={<span>Batch</span>}
        helperText="Pick one"
      />,
    )

    const input = screen.getByRole('radio')
    expect(input).toHaveAttribute('id', 'cohort')
    expect(input).not.toHaveAttribute('aria-invalid')
    expect(input).toHaveAttribute('aria-describedby', 'cohort-helper')
    expect(input.className).toContain('rounded-full')
    expect(screen.queryByText('Required for admins')).not.toBeInTheDocument()
  })
})
