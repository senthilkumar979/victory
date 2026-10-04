import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AwardCategories } from './AwardCategories'

interface CategoryRow {
  id?: string
  name: string
}

const { categoriesState } = vi.hoisted(() => ({
  categoriesState: {
    categories: [] as CategoryRow[],
    isLoading: false,
    error: null as string | null,
    refetch: vi.fn(),
  },
}))

vi.mock('@/hooks/useAwardCategories', () => ({
  useAwardCategories: () => categoriesState,
}))

vi.mock('./AddAwardCategory', () => ({
  AddAwardCategory: function AddAwardCategory({
    show,
    categoryToEdit,
    onSucess,
  }: {
    show: boolean
    categoryToEdit?: CategoryRow
    onSucess: () => void
  }) {
    if (!show) return null
    return (
      <section aria-label="Category form">
        <pre>{JSON.stringify(categoryToEdit ?? null)}</pre>
        <button type="button" onClick={onSucess}>
          Finish category form
        </button>
      </section>
    )
  },
}))

vi.mock('./DeleteAwardCategory', () => ({
  DeleteAwardCategory: function DeleteAwardCategory({
    show,
    categoryToDelete,
    onDelete,
  }: {
    show: boolean
    categoryToDelete: CategoryRow | null
    onDelete: () => void
  }) {
    if (!show) return null
    return (
      <section aria-label="Delete category">
        <pre>{JSON.stringify(categoryToDelete)}</pre>
        <button type="button" onClick={onDelete}>
          Confirm category delete
        </button>
      </section>
    )
  },
}))

function formPayload() {
  const raw = screen.getByRole('region', { name: 'Category form' }).querySelector('pre')
  return JSON.parse(raw?.textContent ?? 'null') as CategoryRow | null
}

beforeEach(() => {
  categoriesState.categories = []
  categoriesState.isLoading = false
  categoriesState.error = null
  categoriesState.refetch.mockReset()
})

afterEach(() => {
  cleanup()
})

describe('AwardCategories', () => {
  it('hides the empty state while loading or after an error', () => {
    categoriesState.isLoading = true
    const { rerender } = render(<AwardCategories />)
    expect(screen.getByText('Loading Award Categories…')).toBeInTheDocument()
    expect(screen.queryByText('No Award Categories configured yet.')).not.toBeInTheDocument()

    categoriesState.isLoading = false
    categoriesState.error = 'read failed'
    rerender(<AwardCategories />)
    expect(screen.getByText(/Failed to load Award Categories\. read failed/)).toBeInTheDocument()
    expect(screen.queryByText('No Award Categories configured yet.')).not.toBeInTheDocument()

    categoriesState.error = null
    rerender(<AwardCategories />)
    expect(screen.getByText('No Award Categories configured yet.')).toBeInTheDocument()
  })

  it('edits only id and name, then clears that target after the form closes', async () => {
    const user = userEvent.setup()
    categoriesState.categories = [{ id: 'cat-1', name: 'Excellence' }]
    render(<AwardCategories />)

    const row = screen.getByText('Excellence').closest('tr')
    if (!row) throw new Error('missing category row')
    const [editButton] = within(row).getAllByRole('button')
    await user.click(editButton)
    expect(formPayload()).toEqual({ id: 'cat-1', name: 'Excellence' })

    await user.click(screen.getByRole('button', { name: 'Finish category form' }))
    expect(categoriesState.refetch).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('region', { name: 'Category form' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add category' }))
    expect(formPayload()).toBeNull()
  })

  it('opens create with no category and refetches after delete', async () => {
    const user = userEvent.setup()
    categoriesState.categories = [{ id: 'cat-1', name: 'Excellence' }]
    render(<AwardCategories />)

    await user.click(screen.getByRole('button', { name: 'Add category' }))
    expect(formPayload()).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Finish category form' }))

    const row = screen.getByText('Excellence').closest('tr')
    if (!row) throw new Error('missing category row')
    const buttons = within(row).getAllByRole('button')
    await user.click(buttons[1])
    const deletePayload = JSON.parse(
      screen.getByRole('region', { name: 'Delete category' }).querySelector('pre')
        ?.textContent ?? 'null',
    )
    expect(deletePayload).toEqual({ id: 'cat-1', name: 'Excellence' })

    await user.click(screen.getByRole('button', { name: 'Confirm category delete' }))
    expect(categoriesState.refetch).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('region', { name: 'Delete category' })).not.toBeInTheDocument()
  })
})
