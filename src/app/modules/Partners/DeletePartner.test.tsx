import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { PartnerFormState } from './Partner.types'
import { DeletePartner } from './DeletePartner'

const { deletePartnerMock, successToastMock, errorToastMock } = vi.hoisted(
  () => ({
    deletePartnerMock: vi.fn(),
    successToastMock: vi.fn(),
    errorToastMock: vi.fn(),
  }),
)

vi.mock('@/hooks/usePartners', () => ({
  usePartners: () => ({ deletePartner: deletePartnerMock }),
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

function makePartner(
  overrides: Partial<PartnerFormState> = {},
): PartnerFormState {
  return {
    id: 'prt-1',
    name: 'Acme Corp',
    company: 'Acme',
    location: 'Chennai',
    primaryEmail: 'ops@acme.test',
    primaryContact: 'Ada',
    secondaryEmail: '',
    secondaryContact: '',
    designation: 'HR',
    category: 'Hiring',
    description: '',
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('DeletePartner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    deletePartnerMock.mockResolvedValue(undefined)
  })

  it('does not delete when the partner has no id', async () => {
    const user = userEvent.setup()
    const onDeleted = vi.fn()

    render(
      <DeletePartner
        show
        partnerToDelete={makePartner({ id: undefined })}
        onClose={vi.fn()}
        onDeleted={onDeleted}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(deletePartnerMock).not.toHaveBeenCalled()
    expect(successToastMock).not.toHaveBeenCalled()
    expect(onDeleted).not.toHaveBeenCalled()
  })

  it('deletes by id and notifies the parent', async () => {
    const user = userEvent.setup()
    const onDeleted = vi.fn()

    render(
      <DeletePartner
        show
        partnerToDelete={makePartner()}
        onClose={vi.fn()}
        onDeleted={onDeleted}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(deletePartnerMock).toHaveBeenCalledWith('prt-1'),
    )
    expect(successToastMock).toHaveBeenCalledTimes(1)
    expect(onDeleted).toHaveBeenCalledTimes(1)
  })

  it('maps Error messages and falls back for non-Error rejects', async () => {
    const user = userEvent.setup()
    const onDeleted = vi.fn()
    deletePartnerMock.mockRejectedValueOnce(new Error('Still linked to students'))

    render(
      <DeletePartner
        show
        partnerToDelete={makePartner()}
        onClose={vi.fn()}
        onDeleted={onDeleted}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(errorToastMock).toHaveBeenCalledWith(
        'Failed to delete partner.',
        expect.objectContaining({ description: 'Still linked to students' }),
      ),
    )
    expect(onDeleted).not.toHaveBeenCalled()

    cleanup()
    errorToastMock.mockClear()
    deletePartnerMock.mockRejectedValueOnce({ message: 'postgrest' })

    render(
      <DeletePartner
        show
        partnerToDelete={makePartner()}
        onClose={vi.fn()}
        onDeleted={onDeleted}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(errorToastMock).toHaveBeenCalledWith(
        'Failed to delete partner.',
        expect.objectContaining({ description: 'Please try again.' }),
      ),
    )
    expect(onDeleted).not.toHaveBeenCalled()
  })
})
