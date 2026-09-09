import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AwardCategoryFormState } from './AwardCategory.types'
import { DeleteAwardCategory } from './DeleteAwardCategory'

const { deleteCategoryMock, successToastMock } = vi.hoisted(() => ({
  deleteCategoryMock: vi.fn(),
  successToastMock: vi.fn(),
}))

vi.mock('@/hooks/useAwardCategories', () => ({
  useAwardCategories: () => ({ deleteCategory: deleteCategoryMock }),
}))
vi.mock('goey-toast', () => ({
  gooeyToast: { success: successToastMock, error: vi.fn() },
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

function makeCategory(
  overrides: Partial<AwardCategoryFormState> = {},
): AwardCategoryFormState {
  return {
    id: 'cat-1',
    name: 'Excellence',
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('DeleteAwardCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    deleteCategoryMock.mockResolvedValue(undefined)
  })

  it('does not delete when the category has no id', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(
      <DeleteAwardCategory
        show
        categoryToDelete={makeCategory({ id: undefined })}
        onDelete={onDelete}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(deleteCategoryMock).not.toHaveBeenCalled()
    expect(successToastMock).not.toHaveBeenCalled()
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('deletes by id and notifies the parent', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(
      <DeleteAwardCategory
        show
        categoryToDelete={makeCategory()}
        onDelete={onDelete}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(deleteCategoryMock).toHaveBeenCalledWith('cat-1'),
    )
    expect(successToastMock).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})
