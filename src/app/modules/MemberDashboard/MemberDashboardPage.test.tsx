import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ProfileData } from '@/types/student.types'
import { useIsAdmin } from '@/hooks/useIsAdmin'

import { MemberDashboardPage } from './MemberDashboardPage'

const {
  replaceMock,
  useAnnouncementsMock,
  useFetchParticipationsByUserMock,
  useMemberDashboardStudentMock,
  useUserMock,
} = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  useAnnouncementsMock: vi.fn(),
  useFetchParticipationsByUserMock: vi.fn(),
  useMemberDashboardStudentMock: vi.fn(),
  useUserMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}))

vi.mock('@clerk/nextjs', () => ({
  useUser: useUserMock,
}))

vi.mock('@/hooks/useCheckIsAuthenticated', () => ({
  useCheckIsAuthenticated: vi.fn(),
}))

vi.mock('@/hooks/useAnnouncements', () => ({
  useAnnouncements: useAnnouncementsMock,
}))

vi.mock('@/hooks/useFetchParticipationsByUser', () => ({
  useFetchParticipationsByUser: useFetchParticipationsByUserMock,
}))

vi.mock('@/hooks/useMemberDashboardStudent', () => ({
  useMemberDashboardStudent: useMemberDashboardStudentMock,
}))

vi.mock('@/hooks/useIsAdmin', () => ({
  useIsAdmin: vi.fn(() => false),
}))

vi.mock('@/hooks/useMemberDashboardAssignments', () => ({
  useMemberDashboardAssignments: vi.fn(() => ({
    assignments: [],
    submissions: {},
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })),
}))

vi.mock('@/hooks/useSessionVideos', () => ({
  useSessionVideos: vi.fn(() => ({
    videos: [],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })),
}))

vi.mock('@/app/modules/MemberDashboard/MemberDashboardAnnouncementsSection', () => ({
  MemberDashboardAnnouncementsSection: () => null,
}))

vi.mock('@/app/modules/MemberDashboard/MemberDashboardHeader', () => ({
  MemberDashboardHeader: () => null,
}))

vi.mock('@/app/modules/MemberDashboard/MemberDashboardParticipationsSection', () => ({
  MemberDashboardParticipationsSection: () => null,
}))

vi.mock('@/app/modules/MemberDashboard/MemberDashboardProfileChecklist', () => ({
  MemberDashboardProfileChecklist: () => null,
}))

vi.mock('@/app/modules/MemberDashboard/MemberDashboardQuickLinks', () => ({
  MemberDashboardQuickLinks: () => null,
}))

vi.mock('@/app/modules/MemberDashboard/MemberDashboardWeekSection', () => ({
  MemberDashboardWeekSection: () => null,
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

describe('MemberDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useIsAdmin).mockReturnValue(false)
    useUserMock.mockReturnValue({
      user: {
        firstName: 'Ada',
        username: 'ada',
        primaryEmailAddress: { emailAddress: 'ada@example.com' },
      },
    })
    useAnnouncementsMock.mockReturnValue({
      announcements: [],
      isLoading: false,
      error: null,
    })
    useFetchParticipationsByUserMock.mockReturnValue({
      participations: [],
      isLoading: false,
      error: null,
    })
  })

  it('redirects members to finish their profile after student data loads', async () => {
    useMemberDashboardStudentMock.mockReturnValue({
      profile: makeProfile({ role: '' }),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    render(<MemberDashboardPage />)

    expect(screen.getByText('Redirecting to your profile…')).toBeInTheDocument()
    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith('/secured/profile'),
    )
  })

  it('uses the complete profile serial number to fetch participations', () => {
    useMemberDashboardStudentMock.mockReturnValue({
      profile: makeProfile(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    render(<MemberDashboardPage />)

    expect(useFetchParticipationsByUserMock).toHaveBeenCalledWith(17)
    expect(replaceMock).not.toHaveBeenCalled()
  })

  it('does not redirect admins when student profile is missing', async () => {
    vi.mocked(useIsAdmin).mockReturnValue(true)
    useMemberDashboardStudentMock.mockReturnValue({
      profile: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    render(<MemberDashboardPage />)

    expect(screen.getByText(/signed in as an admin/i)).toBeInTheDocument()
    expect(replaceMock).not.toHaveBeenCalled()
  })
})
