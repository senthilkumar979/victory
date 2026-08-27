import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MeetingFormFields } from './MeetingFormFields'
import {
  meetingFormSchema,
  type MeetingFormValues,
} from './meetingFormSchema'

const directoryGroup = { id: 'grp-uuid-1', name: 'Team', email: 'g@test.com' }

vi.mock('@/hooks/useGoogleGroups', () => ({
  useGoogleGroups: () => ({
    groups: [directoryGroup],
    isLoading: false,
    error: null,
    refetch: async () => {},
    createGroup: async () => {},
    updateGroup: async () => {},
    deleteGroup: async () => {},
  }),
}))

vi.mock('./useMeetingCoverImageUpload', () => ({
  useMeetingCoverImageUpload: () => ({
    uploadCoverImage: vi.fn(),
    isUploading: false,
    error: null,
  }),
  uploadMeetingCoverImage: vi.fn(),
}))

const defaultMeetingValues: MeetingFormValues = {
  title: '',
  description: '',
  date: '2026-06-01T12:00:00.000Z',
  googleGroupId: 'g@test.com',
  meetingLink: '',
  coverImageUrl: '',
}

function MeetingFormTestHarness({
  onValidSubmit,
  values = defaultMeetingValues,
}: {
  onValidSubmit: (data: MeetingFormValues) => void
  values?: MeetingFormValues
}) {
  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: values,
  })

  return (
    <form onSubmit={form.handleSubmit(onValidSubmit)}>
      <MeetingFormFields
        formId="meeting-form-test"
        form={form}
        stagedCoverFile={null}
        onStagedCoverFileChange={() => {}}
      />
      <button type="submit">Submit</button>
    </form>
  )
}

afterEach(() => {
  cleanup()
})

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

  it('rewrites a stored google_groups.id to the directory email', async () => {
    render(
      <MeetingFormTestHarness
        onValidSubmit={vi.fn()}
        values={{ ...defaultMeetingValues, googleGroupId: 'grp-uuid-1' }}
      />,
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Google Group/)).toHaveValue('g@test.com')
    })
    expect(
      screen.queryByRole('option', { name: /not in directory/ }),
    ).not.toBeInTheDocument()
  })

  it('keeps an unknown group value as an orphan option', () => {
    render(
      <MeetingFormTestHarness
        onValidSubmit={vi.fn()}
        values={{ ...defaultMeetingValues, googleGroupId: 'retired@old.com' }}
      />,
    )

    expect(screen.getByLabelText(/Google Group/)).toHaveValue('retired@old.com')
    expect(
      screen.getByRole('option', { name: /retired@old.com \(not in directory\)/ }),
    ).toBeInTheDocument()
  })
})
