import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { HallOfFameEntry } from './HallOfFame.types'
import { DeleteHallOfFameEntry } from './DeleteHallOfFameEntry'

const { deleteEntryMock, successToastMock, errorToastMock } = vi.hoisted(
  () => ({
    deleteEntryMock: vi.fn(),
    successToastMock: vi.fn(),
    errorToastMock: vi.fn(),
  }),
)

vi.mock('@/hooks/useHallOfFame', () => ({
  useHallOfFame: () => ({ deleteEntry: deleteEntryMock }),
}))
vi.mock('goey-toast', () => ({
  gooeyToast: { success: successToastMock, error: errorToastMock },
}))
vi.mock('@/ui/organisms/modal/Modal', () => {
  const Root = ({
    isOpen,
    children,
  }: {
    isOpen: boolean
    children: ReactNode
  }) => (isOpen ? <section>{children}</section> : null)
  const Slot = ({ children }: { children: ReactNode }) => <>{children}</>
  return { Modal: Object.assign(Root, { Title: Slot, Body: Slot, Footer: Slot }) }
})

function makeEntry(overrides: Partial<HallOfFameEntry> = {}): HallOfFameEntry {
  return {
    id: 'hof-1',
    student_email: 'ada@mentorbridge.in',
    date_of_induction: '2026-06-01',
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('DeleteHallOfFameEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    deleteEntryMock.mockResolvedValue(undefined)
  })

  it('does not delete when the entry has no id', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(
      <DeleteHallOfFameEntry
        show
        entryToDelete={makeEntry({ id: '' })}
        onClose={vi.fn()}
        onDelete={onDelete}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(deleteEntryMock).not.toHaveBeenCalled()
    expect(successToastMock).not.toHaveBeenCalled()
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('deletes by id and notifies the parent', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(
      <DeleteHallOfFameEntry
        show
        entryToDelete={makeEntry()}
        onClose={vi.fn()}
        onDelete={onDelete}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(deleteEntryMock).toHaveBeenCalledWith('hof-1'))
    expect(successToastMock).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('maps Error messages and falls back for non-Error rejects', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    deleteEntryMock.mockRejectedValueOnce(new Error('Row locked'))

    render(
      <DeleteHallOfFameEntry
        show
        entryToDelete={makeEntry()}
        onClose={vi.fn()}
        onDelete={onDelete}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(errorToastMock).toHaveBeenCalledWith(
        'Failed to delete entry.',
        expect.objectContaining({ description: 'Row locked' }),
      ),
    )
    expect(onDelete).not.toHaveBeenCalled()

    cleanup()
    errorToastMock.mockClear()
    deleteEntryMock.mockRejectedValueOnce({ message: 'postgrest' })

    render(
      <DeleteHallOfFameEntry
        show
        entryToDelete={makeEntry()}
        onClose={vi.fn()}
        onDelete={onDelete}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(errorToastMock).toHaveBeenCalledWith(
        'Failed to delete entry.',
        expect.objectContaining({ description: 'Please try again.' }),
      ),
    )
    expect(onDelete).not.toHaveBeenCalled()
  })
})
