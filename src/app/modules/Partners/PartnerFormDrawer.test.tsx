import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { PartnerFormState } from './Partner.types'
import { PartnerFormDrawer } from './PartnerFormDrawer'

const {
  createPartnerMock,
  updatePartnerMock,
  successToastMock,
  errorToastMock,
} = vi.hoisted(() => ({
  createPartnerMock: vi.fn(),
  updatePartnerMock: vi.fn(),
  successToastMock: vi.fn(),
  errorToastMock: vi.fn(),
}))

vi.mock('@/hooks/usePartners', () => ({
  usePartners: () => ({
    createPartner: createPartnerMock,
    updatePartner: updatePartnerMock,
  }),
}))
vi.mock('goey-toast', () => ({
  gooeyToast: { success: successToastMock, error: errorToastMock },
}))
vi.mock('@/ui/organisms/drawer/Drawer', () => {
  const Root = ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? <section>{children}</section> : null
  const Slot = ({ children }: { children: ReactNode }) => <>{children}</>
  return { Drawer: Object.assign(Root, { Title: Slot, Body: Slot, Footer: Slot }) }
})

const existingPartner: PartnerFormState = {
  id: 'partner-1',
  name: 'Jane Doe',
  company: 'Acme Corp',
  location: 'Chennai, India',
  category: 'Recruiter',
  primaryEmail: 'jane@acme.test',
  primaryContact: '+91 98765 43210',
  secondaryEmail: '',
  secondaryContact: '',
  designation: 'Manager',
  description: 'Campus hiring',
}

async function fillPartnerForm(values: {
  name: string
  company: string
  location: string
  email: string
}) {
  const user = userEvent.setup()
  await user.type(screen.getByPlaceholderText('Partner name'), values.name)
  await user.type(screen.getByPlaceholderText('Company name'), values.company)
  await user.type(screen.getByPlaceholderText('e.g. City, Country'), values.location)
  await user.type(screen.getAllByPlaceholderText('email@example.com')[0], values.email)
  return user
}

afterEach(() => {
  cleanup()
})

describe('PartnerFormDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createPartnerMock.mockResolvedValue({ id: 'partner-new' })
    updatePartnerMock.mockResolvedValue(undefined)
  })

  it('trims fields on create and updates an existing partner', async () => {
    const onSuccess = vi.fn()
    const { rerender } = render(
      <PartnerFormDrawer isOpen onClose={vi.fn()} onSuccess={onSuccess} />,
    )

    const user = await fillPartnerForm({
      name: '  Jane Doe  ',
      company: '  Acme Corp  ',
      location: '  Chennai  ',
      email: '  jane@acme.test  ',
    })
    await user.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => expect(createPartnerMock).toHaveBeenCalledTimes(1))
    expect(createPartnerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Jane Doe',
        company: 'Acme Corp',
        location: 'Chennai',
        primaryEmail: 'jane@acme.test',
      }),
    )
    expect(updatePartnerMock).not.toHaveBeenCalled()

    rerender(
      <PartnerFormDrawer
        isOpen
        partnerToEdit={existingPartner}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    )
    await waitFor(() =>
      expect(screen.getByPlaceholderText('Partner name')).toHaveValue('Jane Doe'),
    )
    await user.click(screen.getByRole('button', { name: /update/i }))

    await waitFor(() =>
      expect(updatePartnerMock).toHaveBeenCalledWith(
        'partner-1',
        expect.objectContaining({ name: 'Jane Doe', company: 'Acme Corp' }),
      ),
    )
    expect(createPartnerMock).toHaveBeenCalledTimes(1)
    expect(onSuccess).toHaveBeenCalledTimes(2)
  })

  it('toasts save failures and skips onSuccess', async () => {
    const onSuccess = vi.fn()
    createPartnerMock.mockRejectedValueOnce(new Error('email taken'))

    render(<PartnerFormDrawer isOpen onClose={vi.fn()} onSuccess={onSuccess} />)
    const user = await fillPartnerForm({
      name: 'Jane Doe',
      company: 'Acme Corp',
      location: 'Chennai',
      email: 'jane@acme.test',
    })
    await user.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => expect(errorToastMock).toHaveBeenCalledTimes(1))
    expect(errorToastMock).toHaveBeenCalledWith(
      'Failed to save partner.',
      expect.objectContaining({ description: 'email taken' }),
    )
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
