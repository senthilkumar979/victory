import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AddAwardCategory } from './AddAwardCategory'

const { createCategoryMock, updateCategoryMock, successToastMock } = vi.hoisted(
  () => ({
    createCategoryMock: vi.fn(),
    updateCategoryMock: vi.fn(),
    successToastMock: vi.fn(),
  }),
)

vi.mock('@/hooks/useAwardCategories', () => ({
  useAwardCategories: () => ({
    createCategory: createCategoryMock,
    updateCategory: updateCategoryMock,
    deleteCategory: vi.fn(),
    refetch: vi.fn(),
    categories: [],
    isLoading: false,
    error: null,
  }),
}))

vi.mock('goey-toast', () => ({
  gooeyToast: { success: successToastMock, error: vi.fn() },
}))

vi.mock('@/ui/organisms/modal/Modal', () => {
  const Root = ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? <section>{children}</section> : null
  const Slot = ({ children }: { children: ReactNode }) => <>{children}</>
  return { Modal: Object.assign(Root, { Title: Slot, Body: Slot, Footer: Slot }) }
})

afterEach(() => {
  cleanup()
})

describe('AddAwardCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createCategoryMock.mockResolvedValue(undefined)
    updateCategoryMock.mockResolvedValue(undefined)
  })

  it('ignores whitespace-only names', async () => {
    const user = userEvent.setup()
    const onSucess = vi.fn()

    render(
      <AddAwardCategory show categoryToEdit={undefined} onSucess={onSucess} />,
    )

    await user.type(screen.getByPlaceholderText('e.g. Best Performer'), '   ')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(createCategoryMock).not.toHaveBeenCalled()
    expect(updateCategoryMock).not.toHaveBeenCalled()
    expect(successToastMock).not.toHaveBeenCalled()
    expect(onSucess).not.toHaveBeenCalled()
  })

  it('creates a trimmed category and updates only when an id is present', async () => {
    const user = userEvent.setup()
    const onSucess = vi.fn()

    const { rerender } = render(
      <AddAwardCategory show categoryToEdit={undefined} onSucess={onSucess} />,
    )

    await user.type(
      screen.getByPlaceholderText('e.g. Best Performer'),
      '  Best Performer  ',
    )
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(createCategoryMock).toHaveBeenCalledTimes(1))
    expect(createCategoryMock).toHaveBeenCalledWith({ name: 'Best Performer' })
    expect(updateCategoryMock).not.toHaveBeenCalled()
    expect(onSucess).toHaveBeenCalledTimes(1)

    rerender(
      <AddAwardCategory
        show
        categoryToEdit={{ name: 'Best Performer' }}
        onSucess={onSucess}
      />,
    )

    await waitFor(() =>
      expect(screen.getByPlaceholderText('e.g. Best Performer')).toHaveValue(
        'Best Performer',
      ),
    )
    await user.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() => expect(createCategoryMock).toHaveBeenCalledTimes(2))
    expect(updateCategoryMock).not.toHaveBeenCalled()

    rerender(
      <AddAwardCategory
        show
        categoryToEdit={{ id: 'cat-1', name: 'Best Performer' }}
        onSucess={onSucess}
      />,
    )

    await waitFor(() =>
      expect(screen.getByPlaceholderText('e.g. Best Performer')).toHaveValue(
        'Best Performer',
      ),
    )
    await user.clear(screen.getByPlaceholderText('e.g. Best Performer'))
    await user.type(
      screen.getByPlaceholderText('e.g. Best Performer'),
      '  Rising Star  ',
    )
    await user.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() => expect(updateCategoryMock).toHaveBeenCalledTimes(1))
    expect(updateCategoryMock).toHaveBeenCalledWith('cat-1', {
      name: 'Rising Star',
    })
    expect(createCategoryMock).toHaveBeenCalledTimes(2)
    expect(onSucess).toHaveBeenCalledTimes(3)
  })
})
