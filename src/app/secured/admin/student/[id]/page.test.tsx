import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ProfileData } from '@/types/student.types'

import AdminStudentPage from './page'

const { useGuardianMock, useParamsMock, useStudentMock } = vi.hoisted(() => ({
  useGuardianMock: vi.fn(),
  useParamsMock: vi.fn(),
  useStudentMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useParams: useParamsMock,
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
  }: {
    href: string
    children: ReactNode
  }) => <a href={href}>{children}</a>,
}))

vi.mock('@/hooks/useStudent', () => ({
  useStudent: useStudentMock,
}))

vi.mock('@/hooks/useStudentGuardianDetails', () => ({
  useStudentGuardianDetails: useGuardianMock,
}))

vi.mock('@/atoms/loader/Loader', () => ({
  Loader: ({ isShow }: { isShow: boolean }) =>
    isShow ? <div role="status">Loading student</div> : null,
}))

vi.mock('@/components/profile/StudentProfileView', () => ({
  StudentProfileView: ({
    student,
    guardianDetails,
  }: {
    student: { name: string }
    guardianDetails?: { fatherGuardianDetails?: string }
  }) => (
    <div>
      <p>{student.name}</p>
      <p>guardian:{guardianDetails?.fatherGuardianDetails ?? 'none'}</p>
    </div>
  ),
}))

const student = {
  id: 'student-1',
  name: 'Ada Lovelace',
  picture: '',
  role: 'Engineer',
  email: 'ada@example.com',
  batch: '4',
} as ProfileData

const guardian = {
  fatherGuardianDetails: 'Father note',
  motherDetails: '',
}

describe('admin student page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useParamsMock.mockReturnValue({ id: 'student-1' })
    useStudentMock.mockReturnValue({
      student,
      loading: false,
      error: null,
    })
    useGuardianMock.mockReturnValue(guardian)
  })

  afterEach(() => {
    cleanup()
  })

  it('rejects a non-string id before showing a profile', () => {
    useParamsMock.mockReturnValue({ id: ['student-1', 'extra'] })

    render(<AdminStudentPage />)

    expect(screen.getByText('Invalid student ID.')).toBeInTheDocument()
    expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument()
    expect(useGuardianMock).toHaveBeenCalledWith('', true)
  })

  it('shows a loader while the student is still loading', () => {
    useStudentMock.mockReturnValue({ student: null, loading: true, error: null })

    render(<AdminStudentPage />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading student')
    expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument()
  })

  it('shows a fetch failure without the profile', () => {
    useStudentMock.mockReturnValue({
      student: null,
      loading: false,
      error: 'permission denied',
    })

    render(<AdminStudentPage />)

    expect(
      screen.getByText('Something went wrong while fetching the student.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('permission denied')).not.toBeInTheDocument()
    expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument()
  })

  it('always loads guardian details for the admin profile view', () => {
    render(<AdminStudentPage />)

    expect(screen.getAllByText('Ada Lovelace')).toHaveLength(2)
    expect(screen.getByText(/Father note/)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Edit Profile/ }),
    ).toHaveAttribute('href', '/profile/student-1/edit')
    expect(useStudentMock).toHaveBeenCalledWith('student-1')
    expect(useGuardianMock).toHaveBeenCalledWith('student-1', true)
  })
})
