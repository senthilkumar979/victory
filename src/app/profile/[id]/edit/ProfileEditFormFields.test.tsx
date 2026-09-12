import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ProfileEditFormFields } from './ProfileEditFormFields'
import { toFormValues } from './profileEditFormMapping'
import type { ProfileEditFormValues } from './profileEditFormSchema'

const cohortsState = vi.hoisted(() => ({
  cohorts: [] as { id: string; name: string }[],
}))

const uploadState = vi.hoisted(() => ({
  uploadFile: vi.fn(),
  uploading: null as string | null,
  error: null as string | null,
}))

vi.mock('@/hooks/useCohorts', () => ({
  useCohorts: () => ({
    cohorts: cohortsState.cohorts,
    isLoading: false,
    refetch: async () => {},
  }),
}))

vi.mock('./useProfileFileUpload', () => ({
  useProfileFileUpload: () => ({
    uploadFile: uploadState.uploadFile,
    uploading: uploadState.uploading,
    error: uploadState.error,
  }),
}))

const cohortId = '11111111-1111-4111-8111-111111111111'

function Harness({
  studentId = 'stu-1',
  legacyBatch,
  showAdminFields = false,
  cohortId: initialCohortId = '',
}: {
  studentId?: string
  legacyBatch?: string
  showAdminFields?: boolean
  cohortId?: string
}) {
  const form = useForm<ProfileEditFormValues>({
    defaultValues: { ...toFormValues(null), cohortId: initialCohortId },
  })

  return (
    <ProfileEditFormFields
      formId="profile-edit-form"
      form={form}
      studentId={studentId}
      stagedPictureUrl={null}
      stagedResumeUrl={null}
      onStagedPictureUrl={() => {}}
      onStagedResumeUrl={() => {}}
      legacyBatch={legacyBatch}
      showAdminFields={showAdminFields}
    />
  )
}

afterEach(() => {
  cleanup()
})

beforeEach(() => {
  cohortsState.cohorts = [{ id: cohortId, name: 'Batch 12' }]
  uploadState.uploadFile.mockReset()
  uploadState.uploading = null
  uploadState.error = null
})

describe('ProfileEditFormFields', () => {
  it('maps a trimmed legacy batch name onto the matching cohort when cohortId is empty', async () => {
    render(<Harness legacyBatch="  Batch 12  " />)

    await waitFor(() => {
      expect(screen.getByLabelText(/Cohort/)).toHaveValue(cohortId)
    })
  })

  it('does not overwrite an existing cohortId even when a legacy batch matches', () => {
    const otherId = '22222222-2222-4222-8222-222222222222'
    cohortsState.cohorts = [
      { id: cohortId, name: 'Batch 12' },
      { id: otherId, name: 'Batch 11' },
    ]

    render(<Harness legacyBatch="Batch 12" cohortId={otherId} />)

    expect(screen.getByLabelText(/Cohort/)).toHaveValue(otherId)
  })

  it('leaves cohort empty when the legacy batch has no matching cohort name', () => {
    render(<Harness legacyBatch="Unknown batch" />)

    expect(screen.getByLabelText(/Cohort/)).toHaveValue('')
  })

  it('disables photo and resume uploads until a student id exists', () => {
    render(<Harness studentId="   " />)

    expect(
      screen.getByText(/Save your profile once to enable photo and resume uploads/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Choose image/ }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: /Choose PDF file/ }),
    ).toBeDisabled()
  })

  it('shows guardian fields only for admins', () => {
    const { rerender } = render(<Harness showAdminFields={false} />)

    expect(screen.queryByText('Guardian details')).not.toBeInTheDocument()

    rerender(<Harness showAdminFields />)

    expect(screen.getByText('Guardian details')).toBeInTheDocument()
    expect(screen.getAllByPlaceholderText(/Name, phone, occupation/)).toHaveLength(
      2,
    )
  })
})
