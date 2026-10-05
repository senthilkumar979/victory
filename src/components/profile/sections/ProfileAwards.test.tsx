import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { StudentAwardWithCategory } from '@/hooks/useStudentAwards'

import { ProfileAwards } from './ProfileAwards'

vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
  },
}))

const awardedOn = '2026-06-15T12:00:00.000Z'

function makeAward(
  overrides: Partial<StudentAwardWithCategory> = {},
): StudentAwardWithCategory {
  return {
    id: 'award-1',
    awardedTo: 'ada@mentorbridge.in',
    awardedOn,
    description: '<strong>First place</strong>',
    awardCategoryId: 'cat-1',
    categoryName: 'Backend',
    ...overrides,
  }
}

function expectedDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

afterEach(() => {
  cleanup()
})

describe('ProfileAwards', () => {
  it('shows placeholders and hides award copy while loading', () => {
    const { container } = render(
      <ProfileAwards awards={[makeAward()]} loading />,
    )

    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3)
    expect(screen.queryByText('No awards yet')).not.toBeInTheDocument()
    expect(screen.queryByText('First place')).not.toBeInTheDocument()
    expect(screen.queryByText('Backend')).not.toBeInTheDocument()
  })

  it('shows an empty state when the student has no awards', () => {
    const { container } = render(<ProfileAwards awards={[]} loading={false} />)

    expect(screen.getByText('No awards yet')).toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument()
  })

  it('renders category, date, and HTML description only when they are present', () => {
    render(
      <ProfileAwards
        loading={false}
        awards={[
          makeAward(),
          makeAward({
            id: 'award-2',
            categoryName: '',
            description: '',
            awardedOn: '2026-01-02T12:00:00.000Z',
          }),
        ]}
      />,
    )

    expect(screen.getByText('Backend')).toBeInTheDocument()
    expect(screen.getByText('First place').tagName).toBe('STRONG')
    expect(screen.getByText(expectedDate(awardedOn))).toBeInTheDocument()
    expect(screen.getByText(expectedDate('2026-01-02T12:00:00.000Z'))).toBeInTheDocument()
    expect(screen.getAllByText('Backend')).toHaveLength(1)
    expect(screen.queryByText(/<strong>/)).not.toBeInTheDocument()
  })
})
