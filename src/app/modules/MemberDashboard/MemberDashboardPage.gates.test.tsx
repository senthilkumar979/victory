import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ProfileData } from '@/types/student.types'
import { useIsAdmin } from '@/hooks/useIsAdmin'

import { MemberDashboardPage } from './MemberDashboardPage'

const {
  replaceMock,
  useFetchParticipationsByUserMock,
  useMemberDashboardStudentMock,
} = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  useFetchParticipationsByUserMock: vi.fn(),
  useMemberDashboardStudentMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}))

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: { firstName: 'Ada' } }),
}))

vi.mock('@/hooks/useCheckIsAuthenticated', () => ({
  useCheckIsAuthenticated: vi.fn(),
}))

vi.mock('@/hooks/useIsAdmin', () => ({
  useIsAdmin: vi.fn(() => false),
}))

vi.mock('@/hooks/useAnnouncements', () => ({
  useAnnouncements: () => ({ announcements: [], isLoading: false, error: null }),
}))

vi.mock('@/hooks/useFetchParticipationsByUser', () => ({
  useFetchParticipationsByUser: useFetchParticipationsByUserMock,
}))

vi.mock('@/hooks/useMemberDashboardStudent', () => ({
  useMemberDashboardStudent: useMemberDashboardStudentMock,
}))

vi.mock('@/hooks/useMemberDashboardAssignments', () => ({
  useMemberDashboardAssignments: () => ({
    assignments: [],
    submissions: {},
    isLoading: false,
    error: null,
  }),
}))

vi.mock('@/hooks/useSessionVideos', () => ({
  useSessionVideos: () => ({ videos: [], isLoading: false, error: null }),
}))

vi.mock('@/app/modules/MemberDashboard/MemberDashboardAnnouncementsSection', () => ({
  MemberDashboardAnnouncementsSection: () => null,
}))

vi.mock('@/app/modules/MemberDashboard/MemberDashboardAssignmentsSection', () => ({
  MemberDashboardActionItems: () => null,
  MemberDashboardAssignmentsSection: () => null,
}))

vi.mock('@/app/modules/MemberDashboard/MemberDashboardHeader', () => ({
  MemberDashboardHeader: () => null,
}))

vi.mock('@/app/modules/MemberDashboard/MemberDashboardProfileChecklist', () => ({
  MemberDashboardProfileChecklist: () => null,
}))

vi.mock('@/app/modules/MemberDashboard/MemberDashboardQuickLinks', () => ({
  MemberDashboardQuickLinks: () => null,
}))

vi.mock('@/app/modules/MemberDashboard/MemberDashboardVideosSection', () => ({
  MemberDashboardFeedbackSection: () => null,
  MemberDashboardVideosSection: () => null,
}))

vi.mock('@/app/modules/MemberDashboard/MemberDashboardWeekSection', () => ({
  MemberDashboardWeekSection: () => null,
}))

vi.mock('@/app/modules/MemberDashboard/MemberDashboardParticipationsSection', () => ({
  MemberDashboardParticipationsSection: () => null,
}))

function makeProfile(overrides: Partial<ProfileData> = {}): ProfileData {
  return {
    id: 'student-1',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    picture: 'avatar.png',
    role: 'Engineer',
    batch: 'Batch 1',
    serialNo: 17,
    ...overrides,
  }
}

function mockStudent(state: {
  profile: ProfileData | null
  isLoading: boolean
  error: string | null
  refetch?: () => void
}) {
  useMemberDashboardStudentMock.mockReturnValue({
    refetch: vi.fn(),
    ...state,
  })
}

afterEach(() => {
  cleanup()
})

describe('MemberDashboardPage gates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useIsAdmin).mockReturnValue(false)
    useFetchParticipationsByUserMock.mockReturnValue({
      participations: [],
      isLoading: false,
      error: null,
    })
  })

  it('does not redirect while the student profile is still loading', () => {
    mockStudent({
      profile: makeProfile(),
      isLoading: true,
      error: null,
    })

    const { container } = render(<MemberDashboardPage />)

    expect(container.querySelector('.animate-pulse')).toBeTruthy()
    expect(screen.queryByText(/redirecting to your profile/i)).toBeNull()
    expect(replaceMock).not.toHaveBeenCalled()
  })

  it('shows a profile load failure and retries without redirecting', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()
    mockStudent({
      profile: null,
      isLoading: false,
      error: 'Could not load profile.',
      refetch,
    })

    render(<MemberDashboardPage />)

    expect(screen.getByText('Could not load profile.')).toBeInTheDocument()
    expect(replaceMock).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(refetch).toHaveBeenCalledTimes(1)
    expect(replaceMock).not.toHaveBeenCalled()
  })

  it('does not look up participations for a missing or non-positive serial number', () => {
    for (const serialNo of [0, -1, undefined]) {
      useFetchParticipationsByUserMock.mockClear()
      replaceMock.mockClear()
      mockStudent({
        profile: makeProfile({ serialNo }),
        isLoading: false,
        error: null,
      })

      const view = render(<MemberDashboardPage />)

      expect(useFetchParticipationsByUserMock).toHaveBeenCalledWith(undefined)
      expect(replaceMock).not.toHaveBeenCalled()
      view.unmount()
    }
  })

  it('keeps admins on the dashboard when the student record is loading or failed', () => {
    vi.mocked(useIsAdmin).mockReturnValue(true)

    mockStudent({
      profile: null,
      isLoading: true,
      error: 'Could not load profile.',
    })
    const loading = render(<MemberDashboardPage />)

    expect(screen.getByText(/signed in as an admin/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
    expect(replaceMock).not.toHaveBeenCalled()
    loading.unmount()

    mockStudent({
      profile: null,
      isLoading: false,
      error: 'Could not load profile.',
    })
    render(<MemberDashboardPage />)

    expect(screen.getByText(/signed in as an admin/i)).toBeInTheDocument()
    expect(screen.queryByText('Could not load profile.')).toBeNull()
    expect(replaceMock).not.toHaveBeenCalled()
  })
})
