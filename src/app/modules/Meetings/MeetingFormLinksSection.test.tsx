import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { afterEach, describe, expect, it } from 'vitest'

import { MeetingFormLinksSection } from './MeetingFormLinksSection'
import type { MeetingFormValues } from './meetingFormSchema'

const baseValues: MeetingFormValues = {
  title: 'Weekly sync',
  description: 'Agenda',
  date: '2026-06-01T12:00:00.000Z',
  googleGroupId: 'team@mentorbridge.in',
  meetingLink: '',
  coverImageUrl: '',
}

const LinksHarness = ({
  meetingLink,
}: {
  meetingLink: string | null | undefined
}) => {
  const form = useForm<MeetingFormValues>({
    defaultValues: {
      ...baseValues,
      meetingLink: meetingLink as MeetingFormValues['meetingLink'],
    },
  })

  return <MeetingFormLinksSection formId="meet" control={form.control} />
}

afterEach(() => {
  cleanup()
})

describe('MeetingFormLinksSection', () => {
  it('keeps a null or missing link as an empty controlled value', () => {
    const { rerender } = render(<LinksHarness meetingLink={null} />)
    const input = screen.getByPlaceholderText('https://meet.google.com/...')

    expect(input).toHaveValue('')

    rerender(<LinksHarness meetingLink={undefined} />)
    expect(screen.getByPlaceholderText('https://meet.google.com/...')).toHaveValue(
      '',
    )
  })

  it('shows the stored link and accepts edits', async () => {
    const user = userEvent.setup()
    render(<LinksHarness meetingLink="https://meet.google.com/abc-defg-hij" />)

    const input = screen.getByPlaceholderText('https://meet.google.com/...')
    expect(input).toHaveValue('https://meet.google.com/abc-defg-hij')

    await user.clear(input)
    await user.type(input, 'https://meet.google.com/new-link')
    expect(input).toHaveValue('https://meet.google.com/new-link')
  })
})
