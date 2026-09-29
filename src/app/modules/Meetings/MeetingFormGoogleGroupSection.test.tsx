import { cleanup, render, screen } from '@testing-library/react'
import { useForm, type FieldErrors } from 'react-hook-form'
import { afterEach, describe, expect, it } from 'vitest'

import { MeetingFormGoogleGroupSection } from './MeetingFormGoogleGroupSection'
import type { MeetingFormValues } from './meetingFormSchema'

const groups = [{ id: 'grp-1', name: 'Team', email: 'g@test.com' }]

function Harness({
  errors = {},
  isLoading = false,
  directoryLoadError = null,
  googleGroupId = 'g@test.com',
  showOrphanGroupOption = false,
}: {
  errors?: FieldErrors<MeetingFormValues>
  isLoading?: boolean
  directoryLoadError?: string | null
  googleGroupId?: string
  showOrphanGroupOption?: boolean
}) {
  const form = useForm<MeetingFormValues>({
    defaultValues: {
      title: '',
      description: '',
      date: '2026-06-01T12:00:00.000Z',
      googleGroupId,
      meetingLink: '',
      coverImageUrl: '',
    },
  })

  return (
    <MeetingFormGoogleGroupSection
      formId="meeting-form"
      control={form.control}
      errors={errors}
      groups={groups}
      isLoading={isLoading}
      directoryLoadError={directoryLoadError}
      googleGroupIdWatch={googleGroupId}
      showOrphanGroupOption={showOrphanGroupOption}
    />
  )
}

afterEach(() => {
  cleanup()
})

describe('MeetingFormGoogleGroupSection', () => {
  it('prefers the field error and disables the select while groups load', () => {
    const { rerender } = render(
      <Harness
        isLoading
        directoryLoadError="Could not load groups"
        errors={{
          googleGroupId: { type: 'manual', message: 'Google Group is required' },
        }}
      />,
    )

    const select = screen.getByLabelText(/Google Group/)
    expect(select).toBeDisabled()
    expect(select).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Google Group is required')).toBeInTheDocument()
    expect(screen.queryByText('Could not load groups')).not.toBeInTheDocument()

    rerender(<Harness directoryLoadError="Could not load groups" />)

    expect(screen.getByLabelText(/Google Group/)).toBeEnabled()
    expect(screen.getByText('Could not load groups')).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /not in directory/ })).not.toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Team \| \(g@test.com\)/ })).toHaveValue(
      'g@test.com',
    )
  })

  it('shows an orphan option only when the saved value is outside the directory', () => {
    const { rerender } = render(
      <Harness
        googleGroupId="retired@old.com"
        showOrphanGroupOption
      />,
    )

    expect(
      screen.getByRole('option', { name: /retired@old.com \(not in directory\)/ }),
    ).toHaveValue('retired@old.com')

    rerender(<Harness googleGroupId="" showOrphanGroupOption />)

    expect(screen.queryByRole('option', { name: /not in directory/ })).not.toBeInTheDocument()
    expect(screen.getByLabelText(/Google Group/)).toHaveAttribute(
      'aria-invalid',
      'false',
    )
  })
})
