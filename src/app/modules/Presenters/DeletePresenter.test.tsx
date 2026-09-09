import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DeletePresenter } from './DeletePresenter'
import type { PresenterFormState } from './Presenter.types'

const { deletePresenterMock, successToastMock, errorToastMock } = vi.hoisted(
  () => ({
    deletePresenterMock: vi.fn(),
    successToastMock: vi.fn(),
    errorToastMock: vi.fn(),
  }),
)

vi.mock('@/hooks/usePresenters', () => ({
  usePresenters: () => ({ deletePresenter: deletePresenterMock }),
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

function makePresenter(
  overrides: Partial<PresenterFormState> = {},
): PresenterFormState {
  return {
    id: 'pre-1',
    presentedBy: 'ada@example.com',
    presentedDate: '2026-06-15T10:00:00.000Z',
    topic: 'Intro to React',
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('DeletePresenter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    deletePresenterMock.mockResolvedValue(undefined)
  })

  it('does not delete when the presenter has no id', async () => {
    const user = userEvent.setup()
    const onDeleted = vi.fn()

    render(
      <DeletePresenter
        show
        presenterToDelete={makePresenter({ id: undefined })}
        onClose={vi.fn()}
        onDeleted={onDeleted}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(deletePresenterMock).not.toHaveBeenCalled()
    expect(successToastMock).not.toHaveBeenCalled()
    expect(onDeleted).not.toHaveBeenCalled()
  })

  it('deletes by id and notifies the parent', async () => {
    const user = userEvent.setup()
    const onDeleted = vi.fn()

    render(
      <DeletePresenter
        show
        presenterToDelete={makePresenter()}
        onClose={vi.fn()}
        onDeleted={onDeleted}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(deletePresenterMock).toHaveBeenCalledWith('pre-1'),
    )
    expect(successToastMock).toHaveBeenCalledTimes(1)
    expect(onDeleted).toHaveBeenCalledTimes(1)
  })

  it('maps Error messages and falls back for non-Error rejects', async () => {
    const user = userEvent.setup()
    const onDeleted = vi.fn()
    deletePresenterMock.mockRejectedValueOnce(
      new Error('Presenter is still linked'),
    )

    render(
      <DeletePresenter
        show
        presenterToDelete={makePresenter()}
        onClose={vi.fn()}
        onDeleted={onDeleted}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(errorToastMock).toHaveBeenCalledWith(
        'Failed to delete presenter.',
        expect.objectContaining({ description: 'Presenter is still linked' }),
      ),
    )
    expect(onDeleted).not.toHaveBeenCalled()

    cleanup()
    errorToastMock.mockClear()
    deletePresenterMock.mockRejectedValueOnce({ message: 'postgrest' })

    render(
      <DeletePresenter
        show
        presenterToDelete={makePresenter()}
        onClose={vi.fn()}
        onDeleted={onDeleted}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(errorToastMock).toHaveBeenCalledWith(
        'Failed to delete presenter.',
        expect.objectContaining({ description: 'Please try again.' }),
      ),
    )
    expect(onDeleted).not.toHaveBeenCalled()
  })
})
