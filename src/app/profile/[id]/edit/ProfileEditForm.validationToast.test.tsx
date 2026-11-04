import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { FieldErrors } from 'react-hook-form'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ProfileEditFormValues } from './profileEditFormSchema'
import { ProfileEditForm } from './ProfileEditForm'

const { capture, errorToast, updateStudent, createStudentProfile, resolverState } =
  vi.hoisted(() => ({
    capture: vi.fn(),
    errorToast: vi.fn(),
    updateStudent: vi.fn(),
    createStudentProfile: vi.fn(),
    resolverState: {
      override: null as FieldErrors<ProfileEditFormValues> | null,
    },
  }))

vi.mock('@hookform/resolvers/zod', async () => {
  const actual = await vi.importActual<typeof import('@hookform/resolvers/zod')>(
    '@hookform/resolvers/zod',
  )
  return {
    zodResolver: (...args: Parameters<typeof actual.zodResolver>) => {
      const real = actual.zodResolver(...args)
      return (...inner: Parameters<typeof real>) =>
        resolverState.override
          ? { values: {}, errors: resolverState.override }
          : real(...inner)
    },
  }
})

vi.mock('next/navigation', () => ({ useRouter: () => ({ back: vi.fn() }) }))
vi.mock('@/hooks/useIsAdmin', () => ({ useIsAdmin: () => false }))
vi.mock('@/hooks/useUpdateStudent', () => ({
  useUpdateStudent: () => ({ updateStudent }),
}))
vi.mock('@/hooks/useCreateStudentProfile', () => ({
  useCreateStudentProfile: () => ({ createStudentProfile }),
}))
vi.mock('posthog-js/react', () => ({ usePostHog: () => ({ capture }) }))
vi.mock('goey-toast', () => ({
  gooeyToast: { error: errorToast, success: vi.fn() },
}))
vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))
vi.mock('framer-motion', () => ({ motion: { div: 'div' } }))
vi.mock('@/components/analytics/LogSnagPageView', () => ({
  LogSnagPageView: () => null,
}))
vi.mock('@/components/analytics/PosthogCaptureOnce', () => ({
  PosthogCaptureOnce: () => null,
}))
vi.mock('./ProfileEditFormFields', () => ({
  ProfileEditFormFields: () => null,
}))

function fieldError(message: string) {
  return { type: 'manual', message }
}

async function saveProfile(studentId = '') {
  render(<ProfileEditForm student={null} studentId={studentId} />)
  fireEvent.click(screen.getByRole('button', { name: /save changes/i }))
  await waitFor(() => expect(errorToast).toHaveBeenCalled())
}

describe('ProfileEditForm validation toast', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resolverState.override = null
  })

  afterEach(() => {
    cleanup()
  })

  it('joins the real required-field messages and does not save', async () => {
    await saveProfile()

    expect(errorToast).toHaveBeenCalledWith(
      'Could not save profile',
      expect.objectContaining({
        description:
          'Full name is required · Please select your role or title · Email is required · Select a cohort',
        timing: { displayDuration: 7000 },
      }),
    )
    expect(capture).toHaveBeenCalledWith(
      'profile_form_validation_failed',
      expect.objectContaining({
        student_id: undefined,
        fields: expect.arrayContaining(['name', 'role', 'email', 'cohortId']),
        field_count: 4,
      }),
    )
    expect(updateStudent).not.toHaveBeenCalled()
    expect(createStudentProfile).not.toHaveBeenCalled()
  })

  it('caps the toast at six unique messages after de-duplication', async () => {
    resolverState.override = {
      f1: fieldError('One'),
      f2: fieldError('Two'),
      f3: fieldError('One'),
      f4: fieldError('Three'),
      f5: fieldError('Four'),
      f6: fieldError('Five'),
      f7: fieldError('Six'),
      f8: fieldError('Seven'),
    }
    await saveProfile('student-9')

    const description = errorToast.mock.calls[0]?.[1]?.description as string
    expect(description).toBe('One · Two · Three · Four · Five · Six (+1 more)')
    expect(description).not.toContain('Seven')
    expect(capture).toHaveBeenCalledWith(
      'profile_form_validation_failed',
      expect.objectContaining({ student_id: 'student-9', field_count: 8 }),
    )
    expect(updateStudent).not.toHaveBeenCalled()
  })

  it('uses the fallback description when every message is blank', async () => {
    resolverState.override = {
      name: fieldError('   '),
      role: { type: 'manual' },
    }
    await saveProfile()

    expect(errorToast).toHaveBeenCalledWith(
      'Could not save profile',
      expect.objectContaining({
        description: 'Please check the highlighted fields and try again.',
      }),
    )
  })
})
