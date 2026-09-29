import { cleanup, render, screen } from '@testing-library/react'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { formatDateWithoutTime } from '@/utils/meetingUtils'

import { ProfileGitHub } from './ProfileGitHub'

const { useGetRepositoriesMock } = vi.hoisted(() => ({
  useGetRepositoriesMock: vi.fn(),
}))

vi.mock('@/hooks/useGetRepositores', () => ({
  useGetRepositories: (url?: string) => useGetRepositoriesMock(url),
}))

vi.mock('framer-motion', () => ({
  motion: {
    a: function MotionAnchor({
      children,
      ...props
    }: { children?: ReactNode } & Record<string, unknown>) {
      const rest = { ...props }
      for (const key of [
        'whileHover',
        'whileTap',
        'initial',
        'whileInView',
        'viewport',
        'transition',
      ]) {
        delete rest[key]
      }
      return (
        <a {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
          {children}
        </a>
      )
    },
  },
}))

const updatedAt = '2026-03-15T00:00:00.000Z'

const repo = {
  id: 7,
  name: 'victory',
  fullName: 'ada/victory',
  description: 'A useful library',
  htmlUrl: 'https://github.com/ada/victory',
  stargazersCount: 0,
  languages: { TypeScript: 10, Go: 2 },
  updated_at: updatedAt,
}

afterEach(() => {
  cleanup()
})

describe('ProfileGitHub', () => {
  it('shows loading and error states without the empty-repo copy', () => {
    useGetRepositoriesMock.mockReturnValue({
      repositories: [],
      isLoading: true,
      error: null,
    })

    const { rerender } = render(
      <ProfileGitHub githubUrl="https://github.com/ada" />,
    )

    expect(screen.getByText('Loading repositories...')).toBeInTheDocument()
    expect(screen.queryByText('No repositories found')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /View Profile/ })).not.toBeInTheDocument()

    useGetRepositoriesMock.mockReturnValue({
      repositories: [],
      isLoading: false,
      error: 'GitHub rate limit',
    })
    rerender(<ProfileGitHub githubUrl="https://github.com/ada" />)

    expect(screen.getByText('Error: GitHub rate limit')).toBeInTheDocument()
    expect(screen.queryByText('No repositories found')).not.toBeInTheDocument()
  })

  it('hides the profile link when there is no GitHub URL and shows an empty list', () => {
    useGetRepositoriesMock.mockReturnValue({
      repositories: [],
      isLoading: false,
      error: null,
    })

    render(<ProfileGitHub />)

    expect(useGetRepositoriesMock).toHaveBeenCalledWith(undefined)
    expect(screen.getByRole('heading', { name: 'GitHub' })).toBeInTheDocument()
    expect(screen.getByText('No repositories found')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /View Profile/ })).not.toBeInTheDocument()
  })

  it('renders repo metadata and hides blank description, stars, and dates', () => {
    useGetRepositoriesMock.mockReturnValue({
      repositories: [
        repo,
        {
          ...repo,
          id: 8,
          name: 'notes',
          description: null,
          htmlUrl: 'https://github.com/ada/notes',
          stargazersCount: null,
          languages: {},
          updated_at: '',
        },
      ],
      isLoading: false,
      error: null,
    })

    render(<ProfileGitHub githubUrl="https://github.com/ada" />)

    expect(screen.getByRole('link', { name: /View Profile/ })).toHaveAttribute(
      'href',
      'https://github.com/ada',
    )
    const victory = screen.getByRole('link', { name: /victory/ })
    expect(victory).toHaveAttribute('href', 'https://github.com/ada/victory')
    expect(screen.getByText('A useful library')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Go')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText(formatDateWithoutTime(updatedAt))).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'notes' })).toBeInTheDocument()
    expect(screen.getAllByText('0')).toHaveLength(1)
    expect(screen.getAllByText(formatDateWithoutTime(updatedAt))).toHaveLength(1)
  })
})
