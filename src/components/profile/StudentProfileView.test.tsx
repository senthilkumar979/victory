import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ProfileData } from '@/types/student.types'

import { StudentProfileView } from './StudentProfileView'

const { useStudentAwards, useStudentBlogs } = vi.hoisted(() => ({
  useStudentAwards: vi.fn(),
  useStudentBlogs: vi.fn(),
}))

vi.mock('@/hooks/useStudentAwards', () => ({ useStudentAwards }))
vi.mock('@/hooks/useStudentBlogs', () => ({ useStudentBlogs }))
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, { get: (_target, tag: string) => tag }),
}))
vi.mock('@/components/profile/sections/ProfileHero', () => ({
  ProfileHero: () => <div>Hero</div>,
}))
vi.mock('@/components/profile/sections/ProfileStats', () => ({
  ProfileStats: ({ skillsCount }: { skillsCount: number }) => (
    <div>Skills count {skillsCount}</div>
  ),
}))
vi.mock('@/components/profile/sections/ProfileAwards', () => ({
  ProfileAwards: ({ loading }: { loading: boolean }) => (
    <div>{loading ? 'Awards loading' : 'Awards ready'}</div>
  ),
}))
vi.mock('@/components/profile/sections/ProfileBlogs', () => ({
  ProfileBlogs: () => <div>Blogs section</div>,
}))
vi.mock('@/components/profile/sections/ProfileGitHub', () => ({
  ProfileGitHub: () => <div>GitHub section</div>,
}))
vi.mock('./sections/ProfilePresentations', () => ({
  ProfilePresentations: () => <div>Presentations section</div>,
}))
vi.mock('./sections/ProfileParticipations', () => ({
  ProfileParticipations: () => <div>Participations section</div>,
}))

function makeStudent(overrides: Partial<ProfileData> = {}): ProfileData {
  return {
    id: 'student-1',
    name: 'Ada Lovelace',
    picture: '',
    role: 'Engineer',
    email: 'ada@mentorbridge.in',
    batch: '4',
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('StudentProfileView', () => {
  beforeEach(() => {
    useStudentAwards.mockReturnValue({
      awards: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
    })
    useStudentBlogs.mockReturnValue({
      blogs: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    })
  })

  it('shows populated sections and looks up awards and blogs for that student', () => {
    render(
      <StudentProfileView
        student={makeStudent({
          mediumUsername: 'ada',
          summary: 'Built compilers',
          skillSets: ['Math'],
          experience: [
            {
              company: 'Analytical',
              role: 'Inventor',
              summary: '<em>Difference</em> engine',
              website: 'https://example.com/engine',
            },
          ],
          inspirations: ['Ada Lovelace'],
          mentorBridgeExp: { company: '', role: 'Mentor', summary: '' },
        })}
      />,
    )

    expect(useStudentAwards).toHaveBeenCalledWith('ada@mentorbridge.in')
    expect(useStudentBlogs).toHaveBeenCalledWith('ada', 'Ada Lovelace')
    expect(screen.getByText('Awards loading')).toBeInTheDocument()
    expect(screen.getByText('Skills count 1')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument()
    expect(screen.getByText('Math')).toBeInTheDocument()
    expect(screen.getByText('Difference')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /visit/i })).toHaveAttribute(
      'href',
      'https://example.com/engine',
    )
    expect(screen.getByRole('link', { name: /ada lovelace/i })).toHaveAttribute(
      'href',
      'https://en.wikipedia.org/wiki/Ada Lovelace',
    )
    expect(
      screen.getByRole('heading', { name: 'MentorBridge Experience' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Admin only')).not.toBeInTheDocument()
  })

  it('hides optional sections when the profile has no content', () => {
    render(
      <StudentProfileView
        student={makeStudent({
          summary: '',
          skillSets: [],
          experience: [],
          inspirations: [],
          mentorBridgeExp: { company: '', role: '', summary: '' },
        })}
      />,
    )

    expect(screen.queryByRole('heading', { name: 'About' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Skill Sets' })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Professional Experience' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Inspirations' })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'MentorBridge Experience' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Skills count 0')).toBeInTheDocument()
    expect(screen.queryByText(/could not load guardian/i)).not.toBeInTheDocument()
  })

  it('shows a guardian load failure without admin-only copy', () => {
    render(<StudentProfileView student={makeStudent()} guardianDetails={null} />)

    expect(screen.getByText('Could not load guardian details.')).toBeInTheDocument()
    expect(screen.queryByText('Admin only')).not.toBeInTheDocument()
    expect(screen.queryByText('No guardian details recorded.')).not.toBeInTheDocument()
  })

  it('keeps whitespace content and shows padded guardian notes', () => {
    render(
      <StudentProfileView
        student={makeStudent({
          summary: '   ',
          mentorBridgeExp: { company: '  ', role: '', summary: '' },
        })}
        guardianDetails={{
          fatherGuardianDetails: '   ',
          motherDetails: '  Priya  ',
        }}
      />,
    )

    expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'MentorBridge Experience' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Admin only')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /father/i })).not.toBeInTheDocument()
    expect(
      screen.getByText((_content, element) => element?.textContent === '  Priya  '),
    ).toBeInTheDocument()
  })
})
