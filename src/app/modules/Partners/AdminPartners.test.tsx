import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { PartnerFormState } from './Partner.types'
import { AdminPartners } from './AdminPartners'

const { partnersState } = vi.hoisted(() => ({
  partnersState: {
    partners: [] as PartnerFormState[],
    isLoading: false,
    error: null as string | null,
    refetch: vi.fn(),
  },
}))

vi.mock('@/hooks/usePartners', () => ({
  usePartners: () => partnersState,
}))

vi.mock('./PartnersTable', () => ({
  PartnersTable: function PartnersTable({
    partners,
    onRowClick,
    onEdit,
    onDelete,
  }: {
    partners: PartnerFormState[]
    onRowClick: (partner: PartnerFormState) => void
    onEdit: (partner: PartnerFormState) => void
    onDelete: (partner: PartnerFormState) => void
  }) {
    return (
      <ul>
        {partners.map((partner) => (
          <li key={partner.id}>
            <button type="button" onClick={() => onRowClick(partner)}>{`View ${partner.name}`}</button>
            <button type="button" onClick={() => onEdit(partner)}>{`Edit ${partner.name}`}</button>
            <button type="button" onClick={() => onDelete(partner)}>{`Delete ${partner.name}`}</button>
          </li>
        ))}
      </ul>
    )
  },
}))

vi.mock('./PartnerFormDrawer', () => ({
  PartnerFormDrawer: function PartnerFormDrawer({
    isOpen,
    partnerToEdit,
    onClose,
    onSuccess,
  }: {
    isOpen: boolean
    partnerToEdit?: PartnerFormState
    onClose: () => void
    onSuccess: () => void
  }) {
    if (!isOpen) return null
    return (
      <section aria-label="Partner form">
        <pre>{JSON.stringify(partnerToEdit ?? null)}</pre>
        <button type="button" onClick={onClose}>Close partner form</button>
        <button type="button" onClick={onSuccess}>Save partner form</button>
      </section>
    )
  },
}))

vi.mock('./PartnerDetailsDrawer', () => ({
  PartnerDetailsDrawer: function PartnerDetailsDrawer({
    isOpen,
    partner,
    onEdit,
  }: {
    isOpen: boolean
    partner: PartnerFormState | null
    onClose: () => void
    onEdit: (partner: PartnerFormState) => void
  }) {
    if (!isOpen || !partner) return null
    return (
      <section aria-label="Partner details">
        <button type="button" onClick={() => onEdit(partner)}>Edit from details</button>
      </section>
    )
  },
}))

vi.mock('./DeletePartner', () => ({
  DeletePartner: function DeletePartner({
    show,
    partnerToDelete,
    onClose,
    onDeleted,
  }: {
    show: boolean
    partnerToDelete: PartnerFormState | null
    onClose: () => void
    onDeleted: () => void
  }) {
    if (!show) return null
    return (
      <section aria-label="Delete partner">
        <p>{partnerToDelete?.id}</p>
        <button type="button" onClick={onClose}>Cancel delete</button>
        <button type="button" onClick={onDeleted}>Confirm delete</button>
      </section>
    )
  },
}))

const partner: PartnerFormState = {
  id: 'partner-1',
  name: 'Ada Lovelace',
  company: 'Analytical Engines',
  location: 'London',
  category: 'Hiring',
  primaryEmail: 'ada@example.com',
  primaryContact: '111',
  secondaryEmail: 'ada.alt@example.com',
  secondaryContact: '222',
  designation: 'Partner',
  description: 'Founding partner',
}

function formPayload() {
  const raw = screen.getByRole('region', { name: 'Partner form' }).querySelector('pre')
  return JSON.parse(raw?.textContent ?? 'null') as PartnerFormState | null
}

beforeEach(() => {
  partnersState.partners = []
  partnersState.isLoading = false
  partnersState.error = null
  partnersState.refetch.mockReset()
})

afterEach(() => {
  cleanup()
})

describe('AdminPartners', () => {
  it('shows loading, error, and empty states without the table', () => {
    partnersState.isLoading = true
    const { rerender } = render(<AdminPartners />)
    expect(screen.getByText('Loading partners…')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'View Ada Lovelace' })).not.toBeInTheDocument()

    partnersState.isLoading = false
    partnersState.error = 'directory down'
    rerender(<AdminPartners />)
    expect(screen.getByText('Failed to load partners. directory down')).toBeInTheDocument()
    expect(screen.queryByText('No partners yet.')).not.toBeInTheDocument()

    partnersState.error = null
    rerender(<AdminPartners />)
    expect(screen.getByText('No partners yet.')).toBeInTheDocument()
  })

  it('copies every editable field and clears them when Add partner is clicked', async () => {
    const user = userEvent.setup()
    partnersState.partners = [partner]
    render(<AdminPartners />)

    await user.click(screen.getByRole('button', { name: 'Edit Ada Lovelace' }))
    expect(formPayload()).toEqual(partner)

    await user.click(screen.getByRole('button', { name: 'Add partner' }))
    expect(formPayload()).toBeNull()
  })

  it('opens edit from details and refetches only after save or confirmed delete', async () => {
    const user = userEvent.setup()
    partnersState.partners = [partner]
    render(<AdminPartners />)

    await user.click(screen.getByRole('button', { name: 'View Ada Lovelace' }))
    await user.click(screen.getByRole('button', { name: 'Edit from details' }))
    expect(screen.queryByRole('region', { name: 'Partner details' })).not.toBeInTheDocument()
    expect(formPayload()).toEqual(partner)

    await user.click(screen.getByRole('button', { name: 'Save partner form' }))
    expect(partnersState.refetch).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Delete Ada Lovelace' }))
    await user.click(screen.getByRole('button', { name: 'Cancel delete' }))
    expect(partnersState.refetch).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Delete Ada Lovelace' }))
    await user.click(screen.getByRole('button', { name: 'Confirm delete' }))
    expect(partnersState.refetch).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('region', { name: 'Delete partner' })).not.toBeInTheDocument()
  })
})
