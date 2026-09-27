import { cleanup, render, screen } from '@testing-library/react'
import { format } from 'date-fns'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { HallOfFameEntry } from '@/app/modules/HallOfFame/HallOfFame.types'

import { HallOfFameInductees } from './HallOfFameInductees'

const hallState = {
  entries: [] as HallOfFameEntry[],
  isLoading: false,
  error: null as string | null,
}

vi.mock('@/hooks/useHallOfFame', () => ({
  useHallOfFame: () => hallState,
}))

vi.mock('framer-motion', () => ({
  motion: {
    article: 'article',
    section: 'section',
  },
}))

vi.mock('@/templates/StudentBatch', () => ({
  StudentBatch: function StudentBatchMock({ batch }: { batch: number }) {
    return <span>batch-num:{batch}</span>
  },
}))

vi.mock('@/ui/templates/StudentRole', () => ({
  StudentRole: function StudentRoleMock({ role }: { role: string }) {
    return <span>{role}</span>
  },
}))

const inductionIso = '2026-09-17T12:00:00.000Z'

function entry(overrides: Partial<HallOfFameEntry> = {}): HallOfFameEntry {
  return {
    id: 'hof-1',
    student_email: 'ada.lovelace@mentorbridge.in',
    date_of_induction: inductionIso,
    ...overrides,
  }
}

beforeEach(() => {
  hallState.entries = []
  hallState.isLoading = false
  hallState.error = null
})

afterEach(() => {
  cleanup()
})

describe('HallOfFameInductees', () => {
  it('hides inductee cards while loading, on error, and when the list is empty', () => {
    hallState.isLoading = true
    const { rerender } = render(<HallOfFameInductees />)
    expect(screen.queryByRole('heading', { name: 'Our Inductees' })).not.toBeInTheDocument()

    hallState.isLoading = false
    hallState.error = 'down'
    rerender(<HallOfFameInductees />)
    expect(
      screen.getByText('Unable to load inductees at this time. Please check back later.'),
    ).toBeInTheDocument()

    hallState.error = null
    rerender(<HallOfFameInductees />)
    expect(screen.getByText('Our first inductees will be celebrated here soon.')).toBeInTheDocument()
  })

  it('uses the email local-part and the directory link when the student record is missing', () => {
    hallState.entries = [entry({ date_of_induction: 'not-a-date' })]

    render(<HallOfFameInductees />)

    const card = screen.getByRole('link', { name: /ada.lovelace/i })
    expect(card).toHaveAttribute('href', '/students')
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('ada.lovelace')
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('Inducted not-a-date')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('links a known student, formats a valid date, and distinguishes numeric batches', () => {
    hallState.entries = [
      entry({
        student: {
          id: 'stu-1',
          name: 'Ada Lovelace',
          picture: 'https://cdn.example/ada.png',
          batch: 2026,
          role: 'Frontend Engineer',
          company: 'MentorBridge',
        },
      }),
      entry({
        id: 'hof-2',
        student_email: 'grace@mentorbridge.in',
        student: {
          id: 'stu-2',
          name: '',
          picture: '',
          batch: 'alumni',
          role: '',
          company: '',
        },
      }),
    ]

    render(<HallOfFameInductees />)

    expect(screen.getByRole('link', { name: /Ada Lovelace/ })).toHaveAttribute(
      'href',
      '/students/stu-1',
    )
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveAttribute(
      'src',
      'https://cdn.example/ada.png',
    )
    expect(
      screen.getAllByText(`Inducted ${format(new Date(inductionIso), 'MMM d, yyyy')}`),
    ).toHaveLength(2)
    expect(screen.getByText('batch-num:2026')).toBeInTheDocument()
    expect(screen.getByText('Batch alumni')).toBeInTheDocument()
    const links = screen.getAllByRole('link')
    expect(links[1]).toHaveAttribute('href', '/students/stu-2')
    expect(links[1]).not.toHaveTextContent('grace')
  })
})
