import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AttendanceTrackerDrawer } from './AttendanceTrackerDrawer'
import type { StudentForAttendance } from './Meeting.types'

const {
  setCohortMock,
  fetchAttendanceMock,
  updateAttendanceMock,
  successToastMock,
  errorToastMock,
} = vi.hoisted(() => ({
  setCohortMock: vi.fn(),
  fetchAttendanceMock: vi.fn(),
  updateAttendanceMock: vi.fn(),
  successToastMock: vi.fn(),
  errorToastMock: vi.fn(),
}))

const students: StudentForAttendance[] = [
  { id: 's-0', name: 'No Serial', picture: '', batch: '1', serialNo: 0 },
  { id: 's-5', name: 'Ada', picture: '', batch: '1', serialNo: 5 },
  { id: 's-12', name: 'Grace', picture: '', batch: '1', serialNo: 12 },
]

vi.mock('@/hooks/useStudentsForAttendance', () => ({
  useStudentsForAttendance: () => ({
    students,
    loading: false,
    error: null,
    cohort: '1',
    setCohort: setCohortMock,
    cohortOptions: ['1'],
  }),
}))

vi.mock('@/hooks/useMeetingAttendance', () => ({
  useMeetingAttendance: () => ({
    loading: false,
    error: 'Attendance write failed',
    attendance: [5],
    fetchAttendance: fetchAttendanceMock,
    updateAttendance: updateAttendanceMock,
  }),
}))

vi.mock('goey-toast', () => ({
  gooeyToast: {
    success: successToastMock,
    error: errorToastMock,
  },
}))

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span data-alt={alt} />,
}))

interface DrawerSlotProps {
  children: ReactNode
}

vi.mock('@/ui/organisms/drawer/Drawer', () => {
  const DrawerRoot = ({
    isOpen,
    children,
  }: {
    isOpen: boolean
    children: ReactNode
  }) => (isOpen ? <section>{children}</section> : null)
  const DrawerSlot = ({ children }: DrawerSlotProps) => <>{children}</>

  return {
    Drawer: Object.assign(DrawerRoot, {
      Title: DrawerSlot,
      Body: DrawerSlot,
      Footer: DrawerSlot,
    }),
  }
})

afterEach(() => {
  cleanup()
})

describe('AttendanceTrackerDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchAttendanceMock.mockResolvedValue([5])
    updateAttendanceMock.mockResolvedValue(undefined)
  })

  it('ignores students without a serial number and skips save without a meeting', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()

    render(
      <AttendanceTrackerDrawer
        isOpen
        meeting={null}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    )

    expect(fetchAttendanceMock).not.toHaveBeenCalled()
    expect(screen.getByLabelText(/No Serial/)).toBeDisabled()

    await user.click(screen.getByLabelText(/No Serial/))
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(updateAttendanceMock).not.toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('marks only positive serials and persists the local selection', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()

    render(
      <AttendanceTrackerDrawer
        isOpen
        meeting={{
          id: 'mtg-1',
          title: 'Weekly sync',
          date: '2026-06-01T12:00:00.000Z',
          googleGroupId: 'g@test.com',
          description: 'Notes',
          meetingLink: '',
          coverImageUrl: '',
        }}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    )

    await waitFor(() => expect(fetchAttendanceMock).toHaveBeenCalledWith('mtg-1'))
    expect(screen.getByLabelText(/Ada/)).toBeChecked()
    expect(screen.getByLabelText(/Grace/)).not.toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Mark All' }))
    expect(screen.getByLabelText(/Ada/)).toBeChecked()
    expect(screen.getByLabelText(/Grace/)).toBeChecked()
    expect(screen.getByLabelText(/No Serial/)).not.toBeChecked()

    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() =>
      expect(updateAttendanceMock).toHaveBeenCalledWith('mtg-1', [5, 12]),
    )
    expect(successToastMock).toHaveBeenCalledWith(
      'Attendance saved.',
      expect.objectContaining({
        description: '2 student(s) marked present.',
      }),
    )
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('does not call onSuccess when attendance persist fails', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    updateAttendanceMock.mockRejectedValueOnce(new Error('write failed'))

    render(
      <AttendanceTrackerDrawer
        isOpen
        meeting={{
          id: 'mtg-1',
          title: 'Weekly sync',
          date: '2026-06-01T12:00:00.000Z',
          googleGroupId: 'g@test.com',
          description: 'Notes',
          meetingLink: '',
          coverImageUrl: '',
        }}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    )

    await waitFor(() => expect(fetchAttendanceMock).toHaveBeenCalledWith('mtg-1'))
    await user.click(screen.getByLabelText(/Grace/))
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() =>
      expect(errorToastMock).toHaveBeenCalledWith(
        'Failed to save attendance.',
        expect.objectContaining({ description: 'Attendance write failed' }),
      ),
    )
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
