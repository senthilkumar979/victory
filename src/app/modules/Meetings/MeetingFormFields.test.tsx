import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { describe, expect, it, vi } from 'vitest'

import { MeetingFormFields } from './MeetingFormFields'
import {
  meetingFormSchema,
  type MeetingFormValues,
} from './meetingFormSchema'

vi.mock('@/hooks/useGoogleGroups', () => ({
  useGoogleGroups: () => ({
    groups: [{ id: '1', name: 'Team', email: 'g@test.com' }],
    isLoading: false,
    error: null,
    refetch: async () => {},
    createGroup: async () => {},
    updateGroup: async () => {},
    deleteGroup: async () => {},
  }),
}))

function MeetingFormTestHarness({
  onValidSubmit,
}: {
  onValidSubmit: (data: MeetingFormValues) => void
}) {
  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: {
      title: '',
      description: '',
      date: '2026-06-01T12:00:00.000Z',
      googleGroupId: 'g@test.com',
      meetingLink: '',
      coverImageUrl: '',
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onValidSubmit)}>
      <MeetingFormFields formId="meeting-form-test" form={form} />
      <button type="submit">Submit</button>
    </form>
  )
}

describe('MeetingFormFields', () => {
  it('submits title and description values from controlled fields', async () => {
    const user = userEvent.setup()
    const onValidSubmit = vi.fn()

    render(<MeetingFormTestHarness onValidSubmit={onValidSubmit} />)

    await user.type(
      screen.getByPlaceholderText('e.g. Weekly sync'),
      'Sprint review',
    )
    await user.type(
      screen.getByPlaceholderText('Meeting agenda and notes...'),
      'Discuss goals and blockers.',
    )

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(onValidSubmit).toHaveBeenCalledTimes(1)
    expect(onValidSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Sprint review',
        description: 'Discuss goals and blockers.',
        googleGroupId: 'g@test.com',
      }),
      expect.anything(),
    )
  })
})
