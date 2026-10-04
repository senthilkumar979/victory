import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { PresenterFormState } from './Presenter.types'
import { AdminPresenters } from './AdminPresenters'

const { presentersState } = vi.hoisted(() => ({
  presentersState: {
    presenters: [] as PresenterFormState[],
    isLoading: false,
    error: null as string | null,
    refetch: vi.fn(),
  },
}))

vi.mock('@/hooks/usePresenters', () => ({
  usePresenters: () => presentersState,
}))

vi.mock('./PresentersTable', () => ({
  PresentersTable: function PresentersTable({
    presenters,
    onEdit,
    onDelete,
  }: {
    presenters: PresenterFormState[]
    onEdit: (presenter: PresenterFormState) => void
    onDelete: (presenter: PresenterFormState) => void
  }) {
    return (
      <ul>
        {presenters.map((presenter) => (
          <li key={presenter.id}>
            <button type="button" onClick={() => onEdit(presenter)}>{`Edit ${presenter.topic}`}</button>
            <button type="button" onClick={() => onDelete(presenter)}>{`Delete ${presenter.topic}`}</button>
          </li>
        ))}
      </ul>
    )
  },
}))

vi.mock('./PresenterFormDrawer', () => ({
  PresenterFormDrawer: function PresenterFormDrawer({
    isOpen,
    presenterToEdit,
    onClose,
    onSuccess,
  }: {
    isOpen: boolean
    presenterToEdit?: PresenterFormState
    onClose: () => void
    onSuccess: () => void
  }) {
    if (!isOpen) return null
    return (
      <section aria-label="Presenter form">
        <pre>{JSON.stringify(presenterToEdit ?? null)}</pre>
        <button type="button" onClick={onClose}>Close presenter form</button>
        <button type="button" onClick={onSuccess}>Save presenter form</button>
      </section>
    )
  },
}))

vi.mock('./DeletePresenter', () => ({
  DeletePresenter: function DeletePresenter({
    show,
    presenterToDelete,
    onClose,
    onDeleted,
  }: {
    show: boolean
    presenterToDelete: PresenterFormState | null
    onClose: () => void
    onDeleted: () => void
  }) {
    if (!show) return null
    return (
      <section aria-label="Delete presenter">
        <button type="button" onClick={onClose}>Cancel delete</button>
        <button type="button" onClick={onDeleted}>{presenterToDelete?.id}</button>
      </section>
    )
  },
}))

const presenter: PresenterFormState = {
  id: 'presenter-1',
  presentedBy: 'student-9',
  presentedDate: '2026-04-02',
  topic: 'Closures',
  student: { name: 'Grace Hopper', picture: '', batch: 4 },
}

function formPayload() {
  const raw = screen.getByRole('region', { name: 'Presenter form' }).querySelector('pre')
  return JSON.parse(raw?.textContent ?? 'null') as PresenterFormState | null
}

beforeEach(() => {
  presentersState.presenters = []
  presentersState.isLoading = false
  presentersState.error = null
  presentersState.refetch.mockReset()
})

afterEach(() => {
  cleanup()
})

describe('AdminPresenters', () => {
  it('prefers loading and error over the empty state and hides the table', () => {
    presentersState.isLoading = true
    presentersState.presenters = [presenter]
    const { rerender } = render(<AdminPresenters />)
    expect(screen.getByText('Loading presenters…')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit Closures' })).not.toBeInTheDocument()

    presentersState.isLoading = false
    presentersState.error = 'unavailable'
    rerender(<AdminPresenters />)
    expect(screen.getByText('Failed to load presenters. unavailable')).toBeInTheDocument()
    expect(screen.queryByText('No presenters created yet.')).not.toBeInTheDocument()

    presentersState.error = null
    presentersState.presenters = []
    rerender(<AdminPresenters />)
    expect(screen.getByText('No presenters created yet.')).toBeInTheDocument()
  })

  it('edits schedule fields only, then refetches after save or confirmed delete', async () => {
    const user = userEvent.setup()
    presentersState.presenters = [presenter]
    render(<AdminPresenters />)

    await user.click(screen.getByRole('button', { name: 'Edit Closures' }))
    expect(formPayload()).toEqual({
      id: 'presenter-1',
      presentedBy: 'student-9',
      presentedDate: '2026-04-02',
      topic: 'Closures',
    })

    await user.click(screen.getByRole('button', { name: 'Add presenter' }))
    expect(formPayload()).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Close presenter form' }))
    expect(presentersState.refetch).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Edit Closures' }))
    await user.click(screen.getByRole('button', { name: 'Save presenter form' }))
    expect(presentersState.refetch).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Delete Closures' }))
    await user.click(screen.getByRole('button', { name: 'Cancel delete' }))
    expect(presentersState.refetch).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Delete Closures' }))
    await user.click(screen.getByRole('button', { name: 'presenter-1' }))
    expect(presentersState.refetch).toHaveBeenCalledTimes(2)
  })
})
