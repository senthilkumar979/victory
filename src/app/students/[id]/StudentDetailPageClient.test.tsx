import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ProfileData } from '@/types/student.types'

import { StudentDetailPageClient } from './StudentDetailPageClient'

const adminState = { value: false }
const studentState = {
  student: null as ProfileData | null,
  loading: false,
  error: null as string | null,
}
const guardianState = {
  value: undefined as
    | { fatherGuardianDetails: string; motherDetails: string }
    | null
    | undefined,
}
const guardianCalls: Array<[string, boolean]> = []

vi.mock('@/hooks/useIsAdmin', () => ({
  useIsAdmin: () => adminState.value,
}))

vi.mock('@/hooks/useStudent', () => ({
  useStudent: () => studentState,
}))

vi.mock('@/hooks/useStudentGuardianDetails', () => ({
  useStudentGuardianDetails: (studentId: string, enabled: boolean) => {
    guardianCalls.push([studentId, enabled])
    return guardianState.value
  },
}))

vi.mock('@/components/profile/StudentProfileView', () => ({
  StudentProfileView: function StudentProfileViewMock({
    student,
    guardianDetails,
  }: {
    student: ProfileData
    guardianDetails?: { fatherGuardianDetails?: string; motherDetails?: string } | null
  }) {
    const guardianText =
      guardianDetails === undefined
        ? 'hidden'
        : `${guardianDetails?.fatherGuardianDetails ?? ''}|${guardianDetails?.motherDetails ?? ''}`
    return <div>{`profile:${student.name} guardians:${guardianText}`}</div>
  },
}))

vi.mock('@/components/analytics/LogSnagPageView', () => ({
  LogSnagPageView: () => null,
}))

vi.mock('@/components/analytics/PosthogCaptureOnce', () => ({
  PosthogCaptureOnce: () => null,
}))

vi.mock('@/atoms/breadcrumbs/Breadcrumbs', () => ({
  Breadcrumbs: () => null,
}))

const student: ProfileData = {
  id: 'stu-1',
  name: 'Ada Lovelace',
  picture: '',
  role: 'Frontend Engineer',
  email: 'ada@mentorbridge.in',
  batch: '2026',
}

const secrets = {
  fatherGuardianDetails: 'father private note',
  motherDetails: 'mother private note',
}

beforeEach(() => {
  adminState.value = false
  studentState.student = student
  studentState.loading = false
  studentState.error = null
  guardianState.value = secrets
  guardianCalls.length = 0
})

afterEach(() => {
  cleanup()
})

describe('StudentDetailPageClient', () => {
  it('does not fetch or render guardian details for a non-admin', () => {
    render(<StudentDetailPageClient id="stu-1" />)

    expect(guardianCalls.at(-1)).toEqual(['stu-1', false])
    expect(screen.getByText('profile:Ada Lovelace guardians:hidden')).toBeInTheDocument()
    expect(screen.queryByText(/father private note/)).not.toBeInTheDocument()
  })

  it('passes guardian details through for an admin', () => {
    adminState.value = true

    render(<StudentDetailPageClient id="stu-1" />)

    expect(guardianCalls.at(-1)).toEqual(['stu-1', true])
    expect(
      screen.getByText(
        'profile:Ada Lovelace guardians:father private note|mother private note',
      ),
    ).toBeInTheDocument()
  })

  it('keeps guardian notes off the page while loading, on error, and when the student is missing', () => {
    studentState.loading = true
    const { rerender } = render(<StudentDetailPageClient id="stu-1" />)
    expect(screen.queryByText(/father private note/)).not.toBeInTheDocument()
    expect(screen.queryByText(/profile:/)).not.toBeInTheDocument()

    studentState.loading = false
    studentState.error = 'timeout'
    rerender(<StudentDetailPageClient id="stu-1" />)
    expect(
      screen.getByText('Something went wrong while fetching the student.'),
    ).toBeInTheDocument()

    studentState.error = null
    studentState.student = null
    rerender(<StudentDetailPageClient id="stu-1" />)
    expect(screen.getByText('Student not found.')).toBeInTheDocument()

    rerender(<StudentDetailPageClient id="" />)
    expect(screen.getByText('Invalid student ID.')).toBeInTheDocument()
    expect(guardianCalls.at(-1)).toEqual(['', false])
  })
})
