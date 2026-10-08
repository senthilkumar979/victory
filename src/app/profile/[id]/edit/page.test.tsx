import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ProfileData } from '@/types/student.types'

import ProfileEditPage from './page'

const { useIsAdminMock, useParamsMock, useStudentMock } = vi.hoisted(() => ({
  useIsAdminMock: vi.fn(),
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

vi.mock('@/hooks/useIsAdmin', () => ({
  useIsAdmin: useIsAdminMock,
}))

vi.mock('@/hooks/useStudent', () => ({
  useStudent: useStudentMock,
}))

vi.mock('./ProfileEditForm', () => ({
  ProfileEditForm: ({
    student,
    studentId,
  }: {
    student: { name: string }
    studentId: string
  }) => (
    <form>
      <p>{student.name}</p>
      <p>student-id:{studentId}</p>
    </form>
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

describe('profile edit page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useIsAdminMock.mockReturnValue(false)
    useParamsMock.mockReturnValue({ id: 'student-1' })
    useStudentMock.mockReturnValue({
      student,
      loading: false,
      error: null,
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('rejects a missing id before rendering the form', () => {
    useParamsMock.mockReturnValue({ id: ['student-1'] })

    render(<ProfileEditPage />)

    expect(screen.getByText('Invalid student ID.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Admin' })).toHaveAttribute(
      'href',
      '/secured/admin',
    )
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    expect(useStudentMock).toHaveBeenCalledWith('', { includeAdminFields: false })
  })

  it('shows a loading skeleton without the form or a not-found message', () => {
    useStudentMock.mockReturnValue({ student: null, loading: true, error: null })

    const { container } = render(<ProfileEditPage />)

    expect(container.querySelector('.animate-pulse')).toBeTruthy()
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    expect(screen.queryByText('Student not found.')).not.toBeInTheDocument()
  })

  it('shows the hook error and a way back to admin', () => {
    useStudentMock.mockReturnValue({
      student: null,
      loading: false,
      error: 'Row is hidden',
    })

    render(<ProfileEditPage />)

    expect(screen.getByText('Row is hidden')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Admin' })).toHaveAttribute(
      'href',
      '/secured/admin',
    )
    expect(screen.queryByText('Student not found.')).not.toBeInTheDocument()
  })

  it('shows not found when the student row is missing', () => {
    useStudentMock.mockReturnValue({ student: null, loading: false, error: null })

    render(<ProfileEditPage />)

    expect(screen.getByText('Student not found.')).toBeInTheDocument()
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
  })

  it('requests admin-only columns only for admins', () => {
    useIsAdminMock.mockReturnValue(true)
    render(<ProfileEditPage />)

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('student-id:student-1')).toBeInTheDocument()
    expect(useStudentMock).toHaveBeenCalledWith('student-1', {
      includeAdminFields: true,
    })

    cleanup()
    useIsAdminMock.mockReturnValue(false)
    render(<ProfileEditPage />)

    expect(useStudentMock).toHaveBeenCalledWith('student-1', {
      includeAdminFields: false,
    })
  })
})
