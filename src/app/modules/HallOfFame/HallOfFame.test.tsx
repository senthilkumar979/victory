import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { HallOfFameEntry } from './HallOfFame.types'
import { HallOfFame } from './HallOfFame'

const hookState = {
  entries: [] as HallOfFameEntry[],
  isLoading: false,
  error: null as string | null,
  refetch: vi.fn(),
}

vi.mock('@/hooks/useHallOfFame', () => ({
  useHallOfFame: () => hookState,
}))

vi.mock('@/templates/StudentBatch', () => ({
  StudentBatch: ({ batch }: { batch: number }) => (
    <span>batch-num:{batch}</span>
  ),
}))

function HallOfFameFormDrawerMock({
  isOpen,
  onSuccess,
}: {
  isOpen: boolean
  onSuccess: () => void
}) {
  if (!isOpen) return null
  return (
    <div>
      <p>form-open</p>
      <button type="button" onClick={onSuccess}>
        Complete save
      </button>
    </div>
  )
}

function DeleteHallOfFameEntryMock({
  show,
  entryToDelete,
  onDelete,
}: {
  show: boolean
  entryToDelete: HallOfFameEntry | null
  onDelete: () => void
}) {
  if (!show) return null
  return (
    <div>
      <p>delete:{entryToDelete?.student_email ?? 'none'}</p>
      <button type="button" onClick={onDelete}>
        Confirm delete
      </button>
    </div>
  )
}

vi.mock('./HallOfFameFormDrawer', () => ({
  HallOfFameFormDrawer: HallOfFameFormDrawerMock,
}))

vi.mock('./DeleteHallOfFameEntry', () => ({
  DeleteHallOfFameEntry: DeleteHallOfFameEntryMock,
}))

const withStudent: HallOfFameEntry = {
  id: 'hof-1',
  student_email: 'ada@mentorbridge.in',
  date_of_induction: 'not-a-date',
  student: {
    name: 'Ada Lovelace',
    picture: '',
    batch: 2026,
    role: 'Backend Engineer',
    company: 'MentorBridge',
  },
}

const missingStudent: HallOfFameEntry = {
  id: 'hof-2',
  student_email: 'retired@mentorbridge.in',
  date_of_induction: '2026-03-15',
}

const nonNumericBatch: HallOfFameEntry = {
  id: 'hof-3',
  student_email: 'alumni@mentorbridge.in',
  date_of_induction: 'bad-date',
  student: {
    name: 'Grace Hopper',
    picture: '',
    batch: 'alumni',
    role: 'Mentor',
    company: 'Navy',
  },
}

function rowFor(text: string) {
  const row = screen.getByText(text).closest('tr')
  if (!(row instanceof HTMLElement)) throw new Error(`row missing for ${text}`)
  return row
}

beforeEach(() => {
  hookState.entries = []
  hookState.isLoading = false
  hookState.error = null
  hookState.refetch.mockReset()
})

afterEach(() => {
  cleanup()
})

describe('HallOfFame', () => {
  it('shows loading, error, and empty states without the table', () => {
    hookState.isLoading = true
    const { rerender } = render(<HallOfFame />)
    expect(screen.getByText('Loading entries…')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()

    hookState.isLoading = false
    hookState.error = 'directory down'
    rerender(<HallOfFame />)
    expect(screen.getByText(/Failed to load entries/)).toHaveTextContent(
      'directory down',
    )
    expect(
      screen.queryByText('No Hall of Fame entries yet.'),
    ).not.toBeInTheDocument()

    hookState.error = null
    rerender(<HallOfFame />)
    expect(
      screen.getByText('No Hall of Fame entries yet.'),
    ).toBeInTheDocument()
  })

  it('falls back to email, invalid dates, initials, and non-numeric batches', () => {
    hookState.entries = [withStudent, missingStudent, nonNumericBatch]
    render(<HallOfFame />)

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(within(rowFor('Ada Lovelace')).getByText('A')).toBeInTheDocument()
    expect(within(rowFor('Ada Lovelace')).getByText('not-a-date')).toBeInTheDocument()
    expect(screen.getByText('batch-num:2026')).toBeInTheDocument()

    const missingRow = rowFor('retired@mentorbridge.in')
    expect(within(missingRow).queryByText('Ada Lovelace')).not.toBeInTheDocument()
    expect(within(missingRow).queryByText('A')).not.toBeInTheDocument()

    expect(screen.getByText('Grace Hopper')).toBeInTheDocument()
    expect(screen.getByText('Batch alumni')).toBeInTheDocument()
  })

  it('opens create then refetches after a successful save', async () => {
    const user = userEvent.setup()
    hookState.entries = [withStudent]
    render(<HallOfFame />)

    await user.click(screen.getByRole('button', { name: 'Add to Hall of Fame' }))
    expect(screen.getByText('form-open')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Complete save' }))
    expect(hookState.refetch).toHaveBeenCalled()
    expect(screen.queryByText('form-open')).not.toBeInTheDocument()
  })

  it('opens delete for the selected entry and refetches after confirm', async () => {
    const user = userEvent.setup()
    hookState.entries = [withStudent]
    render(<HallOfFame />)

    await user.click(within(rowFor('Ada Lovelace')).getAllByRole('button')[0])
    expect(screen.getByText('delete:ada@mentorbridge.in')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Confirm delete' }))
    expect(hookState.refetch).toHaveBeenCalled()
    expect(screen.queryByText('delete:ada@mentorbridge.in')).not.toBeInTheDocument()
  })
})
