import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { HallOfFameFormFields } from './HallOfFameFormFields'
import type { HallOfFameFormValues } from './hallOfFameFormSchema'

vi.mock('@/molecules/user-search/UserSearch', () => ({
  UserSearch: function UserSearchMock({
    onSelect,
  }: {
    onSelect: (student: { email: string; name: string }) => void
  }) {
    return (
      <button
        type="button"
        onClick={() =>
          onSelect({ email: 'inductee@test.com', name: 'Grace Hopper' })
        }
      >
        Pick student
      </button>
    )
  },
}))

vi.mock('@/molecules/calendar', () => ({
  CalendarInput: function CalendarInputMock({
    label,
    value,
    onChange,
  }: {
    label: string
    value: string
    onChange: (v: string) => void
  }) {
    return (
      <label>
        {label}
        <input
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    )
  },
}))

function Harness() {
  const form = useForm<HallOfFameFormValues>({
    defaultValues: { studentEmail: '', dateOfInduction: '' },
  })

  return (
    <>
      <HallOfFameFormFields formId="hof-form" form={form} />
      <output data-testid="student-email">{form.watch('studentEmail')}</output>
    </>
  )
}

afterEach(() => {
  cleanup()
})

describe('HallOfFameFormFields', () => {
  it('writes the selected student email into the induction form', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    expect(screen.getByTestId('student-email')).toHaveTextContent('')

    await user.click(screen.getByRole('button', { name: 'Pick student' }))

    expect(screen.getByTestId('student-email')).toHaveTextContent(
      'inductee@test.com',
    )
  })
})
