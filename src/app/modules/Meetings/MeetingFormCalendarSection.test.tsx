import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MeetingFormCalendarSection } from './MeetingFormCalendarSection'
import type { MeetingFormValues } from './meetingFormSchema'

vi.mock('@/molecules/calendar', () => ({
  CalendarInput: function CalendarInputMock({
    id,
    label,
    value,
  }: {
    id: string
    label: string
    value: string
  }) {
    return <input id={id} aria-label={label} value={value} readOnly />
  },
}))

const CalendarHarness = () => {
  const form = useForm<MeetingFormValues>({
    defaultValues: {
      title: 'Weekly sync',
      description: 'Agenda',
      date: '2026-06-01T12:00:00.000Z',
      googleGroupId: 'team@mentorbridge.in',
      meetingLink: '',
      coverImageUrl: '',
    },
  })

  return (
    <>
      <button
        type="button"
        onClick={() =>
          form.setError('date', {
            type: 'manual',
            message: 'Date and time are required',
          })
        }
      >
        Flag date
      </button>
      <button type="button" onClick={() => form.clearErrors('date')}>
        Clear date
      </button>
      <MeetingFormCalendarSection
        formId="meet"
        control={form.control}
        errors={form.formState.errors}
      />
    </>
  )
}

afterEach(() => {
  cleanup()
})

describe('MeetingFormCalendarSection', () => {
  it('passes the stored instant through and shows only an active date error', async () => {
    const user = userEvent.setup()
    render(<CalendarHarness />)

    expect(
      screen.getByLabelText('Date (Indian Standard Time, 24h)'),
    ).toHaveValue('2026-06-01T12:00:00.000Z')
    expect(screen.queryByText('Date and time are required')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Flag date' }))
    expect(screen.getByText('Date and time are required')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear date' }))
    expect(screen.queryByText('Date and time are required')).not.toBeInTheDocument()
  })
})
