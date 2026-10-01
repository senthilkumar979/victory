import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { CalendarInput } from './CalendarInput'

function Harness({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial)
  return (
    <>
      <CalendarInput label="Due date" value={value} onChange={setValue} />
      <button type="button">Outside</button>
      <output data-testid="stored">{value}</output>
    </>
  )
}

afterEach(() => {
  cleanup()
})

describe('CalendarInput', () => {
  it('shows IST wall time for offset and Zulu values', () => {
    const { unmount } = render(
      <Harness initial="2025-03-15T14:30:00+05:30" />,
    )

    expect(screen.getByRole('textbox', { name: 'Due date' })).toHaveValue(
      'Mar 15, 2025, 14:30',
    )

    unmount()
    render(<Harness initial="2025-03-15T03:45:00.000Z" />)
    expect(screen.getByRole('textbox', { name: 'Due date' })).toHaveValue(
      'Mar 15, 2025, 09:15',
    )
  })

  it('leaves the field empty for blank and unparseable values', () => {
    const { unmount } = render(<Harness initial="   " />)
    const input = screen.getByRole('textbox', { name: 'Due date' })

    expect(input).toHaveValue('')
    expect(input).toHaveAttribute('placeholder', 'Select date and time (IST)')

    unmount()
    render(<Harness initial="not-a-date" />)
    expect(screen.getByRole('textbox', { name: 'Due date' })).toHaveValue('')
  })

  it('writes an IST timestamp when the time changes and closes on Escape', async () => {
    const user = userEvent.setup()
    render(<Harness initial="2025-03-15T03:45:00.000Z" />)

    await user.click(screen.getByRole('textbox', { name: 'Due date' }))
    await user.selectOptions(screen.getByLabelText('Hour (24h)'), '18')

    expect(screen.getByTestId('stored')).toHaveTextContent(
      '2025-03-15T18:15:00+05:30',
    )
    expect(screen.getByRole('textbox', { name: 'Due date' })).toHaveValue(
      'Mar 15, 2025, 18:15',
    )
    expect(screen.queryByLabelText('Hour (24h)')).not.toBeInTheDocument()

    await user.click(screen.getByRole('textbox', { name: 'Due date' }))
    expect(screen.getByLabelText('Hour (24h)')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByLabelText('Hour (24h)')).not.toBeInTheDocument()
  })

  it('closes when the pointer leaves the field', async () => {
    const user = userEvent.setup()
    render(<Harness initial="2025-03-15T03:45:00.000Z" />)

    await user.click(screen.getByRole('textbox', { name: 'Due date' }))
    expect(screen.getByLabelText('Minute')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Outside' }))
    expect(screen.queryByLabelText('Minute')).not.toBeInTheDocument()
  })
})
