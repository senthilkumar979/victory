import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { StudentsFilter } from './StudentsFilter'
import type { StudentsFilterOptions, StudentsFilterState } from '../students.types'

const emptyFilters: StudentsFilterState = {
  cohort: '',
  company: '',
  role: '',
  nameSearch: '',
}

const options: StudentsFilterOptions = {
  cohorts: [{ id: 'c1', name: 'Cohort 2026' }],
  companies: ['MentorBridge'],
  roles: ['Engineer'],
}

afterEach(() => {
  cleanup()
})

describe('StudentsFilter', () => {
  it('hides chips until a filter is set and maps unknown cohort ids to the raw value', () => {
    const { rerender } = render(
      <StudentsFilter
        filters={emptyFilters}
        options={options}
        onFiltersChange={vi.fn()}
      />,
    )

    expect(screen.queryByLabelText('Clear all filters')).not.toBeInTheDocument()

    rerender(
      <StudentsFilter
        filters={{ ...emptyFilters, cohort: 'retired-id' }}
        options={options}
        onFiltersChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Cohort: retired-id')).toBeInTheDocument()
    expect(screen.getByLabelText('Clear all filters')).toBeInTheDocument()
  })

  it('clears a single chip without dropping the other filters', async () => {
    const user = userEvent.setup()
    const onFiltersChange = vi.fn()

    render(
      <StudentsFilter
        filters={{
          cohort: 'c1',
          company: 'MentorBridge',
          role: '',
          nameSearch: 'Ada',
        }}
        options={options}
        onFiltersChange={onFiltersChange}
      />,
    )

    expect(screen.getByText('Cohort: Cohort 2026')).toBeInTheDocument()
    await user.click(screen.getByLabelText('Clear name filter'))

    expect(onFiltersChange).toHaveBeenCalledWith({
      cohort: 'c1',
      company: 'MentorBridge',
      role: '',
      nameSearch: '',
    })
  })

  it('Clear All resets every filter key', async () => {
    const user = userEvent.setup()
    const onFiltersChange = vi.fn()

    render(
      <StudentsFilter
        filters={{
          cohort: 'c1',
          company: 'MentorBridge',
          role: 'Engineer',
          nameSearch: 'Ada',
        }}
        options={options}
        onFiltersChange={onFiltersChange}
      />,
    )

    await user.click(screen.getByLabelText('Clear all filters'))
    expect(onFiltersChange).toHaveBeenCalledWith(emptyFilters)
  })

  it('does not notify parent when a chip clear is disabled', async () => {
    const user = userEvent.setup()
    const onFiltersChange = vi.fn()

    render(
      <StudentsFilter
        filters={{ ...emptyFilters, nameSearch: 'Ada' }}
        options={options}
        onFiltersChange={onFiltersChange}
        disabled
      />,
    )

    await user.click(screen.getByLabelText('Clear name filter'))
    expect(onFiltersChange).not.toHaveBeenCalled()
  })
})
