import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AwardFormState } from './Award.types'
import { DeleteAward } from './DeleteAward'

const { deleteAwardMock, successToastMock, errorToastMock } = vi.hoisted(
  () => ({
    deleteAwardMock: vi.fn(),
    successToastMock: vi.fn(),
    errorToastMock: vi.fn(),
  }),
)

vi.mock('@/hooks/useAwards', () => ({
  useAwards: () => ({ deleteAward: deleteAwardMock }),
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

function makeAward(overrides: Partial<AwardFormState> = {}): AwardFormState {
  return {
    id: 'awd-1',
    awardedTo: 'ada@mentorbridge.in',
    awardedOn: '2026-06-01',
    description: 'Excellence',
    awardCategoryId: 'cat-1',
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('DeleteAward', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    deleteAwardMock.mockResolvedValue(undefined)
  })

  it('does not delete when the award has no id', async () => {
    const user = userEvent.setup()
    const onDeleted = vi.fn()

    render(
      <DeleteAward
        show
        awardToDelete={makeAward({ id: undefined })}
        onClose={vi.fn()}
        onDeleted={onDeleted}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(deleteAwardMock).not.toHaveBeenCalled()
    expect(successToastMock).not.toHaveBeenCalled()
    expect(onDeleted).not.toHaveBeenCalled()
  })

  it('deletes by id and notifies the parent', async () => {
    const user = userEvent.setup()
    const onDeleted = vi.fn()

    render(
      <DeleteAward
        show
        awardToDelete={makeAward()}
        onClose={vi.fn()}
        onDeleted={onDeleted}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(deleteAwardMock).toHaveBeenCalledWith('awd-1'))
    expect(successToastMock).toHaveBeenCalledTimes(1)
    expect(onDeleted).toHaveBeenCalledTimes(1)
  })

  it('maps Error messages and falls back for non-Error rejects', async () => {
    const user = userEvent.setup()
    const onDeleted = vi.fn()
    deleteAwardMock.mockRejectedValueOnce(new Error('Category in use'))

    render(
      <DeleteAward
        show
        awardToDelete={makeAward()}
        onClose={vi.fn()}
        onDeleted={onDeleted}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(errorToastMock).toHaveBeenCalledWith(
        'Failed to delete award.',
        expect.objectContaining({ description: 'Category in use' }),
      ),
    )
    expect(onDeleted).not.toHaveBeenCalled()

    cleanup()
    errorToastMock.mockClear()
    deleteAwardMock.mockRejectedValueOnce({ message: 'postgrest' })

    render(
      <DeleteAward
        show
        awardToDelete={makeAward()}
        onClose={vi.fn()}
        onDeleted={onDeleted}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(errorToastMock).toHaveBeenCalledWith(
        'Failed to delete award.',
        expect.objectContaining({ description: 'Please try again.' }),
      ),
    )
    expect(onDeleted).not.toHaveBeenCalled()
  })
})
