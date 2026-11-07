import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { dateFromIST } from '@/utils/dateISTUtils'

import { Calendar } from './Calendar'

/** 2025-03-15 09:15 IST. */
const march15MorningIst = new Date('2025-03-15T03:45:00.000Z')

afterEach(() => {
  cleanup()
})

describe('Calendar IST time', () => {
  it('keeps the time controls disabled until a day is selected', () => {
    const onSelect = vi.fn()
    render(<Calendar onSelect={onSelect} />)

    expect(screen.getByLabelText('Hour (24h)')).toBeDisabled()
    expect(screen.getByLabelText('Minute')).toBeDisabled()
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('changes the hour and minute in IST and keeps the same calendar day', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Calendar selected={march15MorningIst} onSelect={onSelect} />)

    expect(screen.getByLabelText('Hour (24h)')).toHaveValue('9')
    expect(screen.getByLabelText('Minute')).toHaveValue('15')

    await user.selectOptions(screen.getByLabelText('Hour (24h)'), '18')
    expect(onSelect).toHaveBeenCalledWith(dateFromIST(2025, 2, 15, 18, 15))

    await user.selectOptions(screen.getByLabelText('Minute'), '0')
    expect(onSelect).toHaveBeenLastCalledWith(dateFromIST(2025, 2, 15, 9, 0))
  })

  it('keeps the current IST time when another day is chosen', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Calendar selected={march15MorningIst} onSelect={onSelect} />)

    const grid = screen.getByRole('grid')
    const cell = grid.querySelector<HTMLElement>('[data-day]:not([data-outside])')
    const iso = cell?.getAttribute('data-day')
    expect(iso).toEqual(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/))
    const [year, month, day] = iso!.split('-').map(Number)

    await user.click(within(cell!).getByRole('button'))

    expect(onSelect).toHaveBeenCalledWith(
      dateFromIST(year, month - 1, day, 9, 15),
    )
  })
})
