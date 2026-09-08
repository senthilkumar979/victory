import { cleanup, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { MeetingFormState, StudentForAttendance } from './Meeting.types'
import { MeetingDetailsDrawer } from './MeetingDetailsDrawer'

const {
  fetchAttendanceMock,
  fetchStudentsMock,
  studentsState,
} = vi.hoisted(() => ({
  fetchAttendanceMock: vi.fn(),
  fetchStudentsMock: vi.fn(),
  studentsState: {
    students: [] as StudentForAttendance[],
    loading: false,
    error: null as string | null,
  },
}))

vi.mock('@/hooks/useMeetingAttendance', () => ({
  useMeetingAttendance: () => ({
    fetchAttendance: fetchAttendanceMock,
  }),
}))

vi.mock('@/hooks/useStudentsBySerialNumbers', () => ({
  useStudentsBySerialNumbers: () => ({
    students: studentsState.students,
    loading: studentsState.loading,
    error: studentsState.error,
    fetchStudents: fetchStudentsMock,
  }),
}))

vi.mock('./MeetingCoverImage', () => ({
  MeetingCoverImage: () => <div data-testid="meeting-cover" />,
}))

vi.mock('@/templates/CalendarDate', () => ({
  CalendarDate: () => <span>calendar-date</span>,
}))

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span data-alt={alt} />,
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

vi.mock('@/ui/organisms/drawer/Drawer', () => {
  const DrawerRoot = ({
    isOpen,
    children,
  }: {
    isOpen: boolean
    children: ReactNode
  }) => (isOpen ? <section>{children}</section> : null)
  const DrawerSlot = ({ children }: { children: ReactNode }) => <>{children}</>

  return {
    Drawer: Object.assign(DrawerRoot, {
      Title: DrawerSlot,
      Body: DrawerSlot,
      Footer: DrawerSlot,
    }),
  }
})

function makeMeeting(
  overrides: Partial<MeetingFormState> = {},
): MeetingFormState {
  return {
    id: 'mtg-1',
    title: 'Weekly standup',
    date: '2026-06-01T00:00:00+05:30',
    googleGroupId: 'grp-1',
    description: '',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    coverImageUrl: '',
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('MeetingDetailsDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    studentsState.students = []
    studentsState.loading = false
    studentsState.error = null
    fetchAttendanceMock.mockResolvedValue([12, 15])
    fetchStudentsMock.mockResolvedValue(undefined)
  })

  it('clears students when closed and skips attendance without a meeting id', async () => {
    render(
      <MeetingDetailsDrawer
        meeting={makeMeeting()}
        isOpen={false}
        onClose={vi.fn()}
      />,
    )

    await waitFor(() => expect(fetchStudentsMock).toHaveBeenCalledWith([]))
    expect(fetchAttendanceMock).not.toHaveBeenCalled()

    cleanup()
    fetchStudentsMock.mockClear()

    render(
      <MeetingDetailsDrawer
        meeting={makeMeeting({ id: undefined })}
        isOpen
        onClose={vi.fn()}
      />,
    )

    expect(fetchAttendanceMock).not.toHaveBeenCalled()
    expect(fetchStudentsMock).not.toHaveBeenCalled()
  })

  it('loads attendance serials then students when opened', async () => {
    render(
      <MeetingDetailsDrawer
        meeting={makeMeeting()}
        isOpen
        onClose={vi.fn()}
      />,
    )

    await waitFor(() =>
      expect(fetchAttendanceMock).toHaveBeenCalledWith('mtg-1'),
    )
    await waitFor(() =>
      expect(fetchStudentsMock).toHaveBeenCalledWith([12, 15]),
    )
  })

  it('hides attendance and does not offer a join link for whitespace-only URLs', () => {
    render(
      <MeetingDetailsDrawer
        meeting={makeMeeting({
          title: '',
          meetingLink: '   ',
        })}
        isOpen
        onClose={vi.fn()}
        isHideAttendance
      />,
    )

    expect(screen.getByText('Untitled meeting')).toBeInTheDocument()
    expect(screen.queryByText('Attendance')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /join meeting/i }),
    ).not.toBeInTheDocument()
  })

  it('shows attendance states and a join link when a meeting URL exists', () => {
    studentsState.students = [
      {
        id: 'stu-1',
        name: 'Ada Lovelace',
        picture: '',
        batch: '2024',
        serialNo: 12,
      },
    ]

    const { rerender } = render(
      <MeetingDetailsDrawer
        meeting={makeMeeting()}
        isOpen
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('1 present')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /join meeting/i })).toHaveAttribute(
      'href',
      'https://meet.google.com/abc-defg-hij',
    )

    studentsState.students = []
    studentsState.error = 'Failed to fetch attendance'
    rerender(
      <MeetingDetailsDrawer
        meeting={makeMeeting()}
        isOpen
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByText('Failed to fetch attendance')).toBeInTheDocument()

    studentsState.error = null
    rerender(
      <MeetingDetailsDrawer
        meeting={makeMeeting()}
        isOpen
        onClose={vi.fn()}
      />,
    )
    expect(
      screen.getByText('No attendance recorded for this meeting.'),
    ).toBeInTheDocument()
  })
})
