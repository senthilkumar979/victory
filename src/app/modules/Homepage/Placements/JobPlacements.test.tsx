import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { JobPlacements } from './JobPlacements'

interface PlacementState {
  students: Array<{ id: string; name: string }>
  loading: boolean
  error: string | null
}

const { placementState } = vi.hoisted(() => ({
  placementState: {
    students: [],
    loading: false,
    error: null,
  } as PlacementState,
}))

vi.mock('motion/react', () => {
  function MotionHeader({
    children,
    className,
  }: {
    children?: React.ReactNode
    className?: string
  }) {
    return <header className={className}>{children}</header>
  }

  return {
    useReducedMotion: () => true,
    motion: { header: MotionHeader },
  }
})

vi.mock('./PlacementStudentCard', () => ({
  PlacementStudentCard: ({ student }: { student: { name: string } }) => (
    <article>{student.name}</article>
  ),
}))

vi.mock('@/hooks/useStudentsByPlacements', () => ({
  useStudentsByPlacements: () => placementState,
}))

function skeletonCount(container: HTMLElement): number {
  return [...container.querySelectorAll('div')].filter((element) =>
    element.className.includes('aspect-[4/5]'),
  ).length
}

describe('JobPlacements', () => {
  beforeEach(() => {
    placementState.students = []
    placementState.loading = false
    placementState.error = null
  })

  afterEach(() => {
    cleanup()
  })

  it('shows skeletons instead of cards or the empty copy while loading', () => {
    placementState.loading = true
    placementState.students = [{ id: 'student-1', name: 'Ada Lovelace' }]

    const { container } = render(<JobPlacements />)

    expect(skeletonCount(container)).toBe(6)
    expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Placement stories will appear here soon.'),
    ).not.toBeInTheDocument()
  })

  it('shows the fetch error instead of the empty-state copy', () => {
    placementState.error = 'Failed to fetch students'

    render(<JobPlacements />)

    expect(screen.getByText('Failed to fetch students')).toBeInTheDocument()
    expect(
      screen.queryByText('Placement stories will appear here soon.'),
    ).not.toBeInTheDocument()
  })

  it('shows the empty copy only after a successful query with no placements', () => {
    render(<JobPlacements />)

    expect(
      screen.getByText('Placement stories will appear here soon.'),
    ).toBeInTheDocument()
  })

  it('renders a card for each placed student', () => {
    placementState.students = [
      { id: 'student-1', name: 'Ada Lovelace' },
      { id: 'student-2', name: 'Grace Hopper' },
    ]

    const { container } = render(<JobPlacements />)

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument()
    expect(skeletonCount(container)).toBe(0)
    expect(
      screen.queryByText('Placement stories will appear here soon.'),
    ).not.toBeInTheDocument()
  })
})
