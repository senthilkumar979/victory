import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { ProfileData } from '@/types/student.types'

import { StudentsCardGrid } from './StudentsCardGrid'

vi.mock('framer-motion', () => {
  function Motion({ children }: { children?: ReactNode }) {
    return <div>{children}</div>
  }

  return {
    motion: new Proxy({}, { get: () => Motion }),
  }
})

vi.mock('./StudentCard', () => ({
  StudentCard: ({ student }: { student: { name: string } }) => (
    <article>{student.name}</article>
  ),
}))

function student(id: string, name: string): ProfileData {
  return {
    id,
    name,
    picture: '',
    role: 'Engineer',
    email: `${id}@example.com`,
    batch: '4',
  }
}

describe('StudentsCardGrid', () => {
  afterEach(() => {
    cleanup()
  })

  it('prefers the loading skeleton over an error or an empty list', () => {
    render(
      <StudentsCardGrid
        students={[]}
        loading
        error="Could not load students"
      />,
    )

    expect(screen.queryByText('Unable to load students')).not.toBeInTheDocument()
    expect(screen.queryByText('No students found')).not.toBeInTheDocument()
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })

  it('shows the error instead of the empty state when the list is empty', () => {
    render(
      <StudentsCardGrid students={[]} loading={false} error="Directory unavailable" />,
    )

    expect(screen.getByText('Unable to load students')).toBeInTheDocument()
    expect(screen.getByText('Directory unavailable')).toBeInTheDocument()
    expect(screen.queryByText('No students found')).not.toBeInTheDocument()
  })

  it('shows an empty state only when loading finished without an error', () => {
    render(<StudentsCardGrid students={[]} loading={false} error={null} />)

    expect(screen.getByText('No students found')).toBeInTheDocument()
    expect(
      screen.getByText(/Try adjusting your filters or search/),
    ).toBeInTheDocument()
  })

  it('renders a card for each student', () => {
    render(
      <StudentsCardGrid
        students={[student('1', 'Ada Lovelace'), student('2', 'Grace Hopper')]}
        loading={false}
        error={null}
      />,
    )

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument()
    expect(screen.queryByText('No students found')).not.toBeInTheDocument()
  })
})
