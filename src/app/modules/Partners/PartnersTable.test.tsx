import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { PartnerFormState } from './Partner.types'
import { PartnersTable } from './PartnersTable'

const partner: PartnerFormState = {
  id: 'p-1',
  name: 'Ada Partner',
  company: 'acme labs',
  location: '',
  primaryEmail: '',
  primaryContact: '',
  secondaryEmail: '',
  secondaryContact: '',
  designation: '',
  category: '',
  description: '',
}

afterEach(() => {
  cleanup()
})

describe('PartnersTable', () => {
  it('uppercases the company and uses em dashes for empty fields', () => {
    render(
      <PartnersTable
        partners={[partner]}
        onRowClick={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    const row = screen.getByRole('button', { name: /Ada Partner/ })
    expect(row).toHaveTextContent('ACME LABS')
    expect(row).toHaveTextContent('—')
    expect(row.textContent?.match(/—/g)).toHaveLength(5)
  })

  it('keeps edit and delete clicks from opening the row', async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    render(
      <PartnersTable
        partners={[{ ...partner, category: 'Hiring', designation: 'CTO' }]}
        onRowClick={onRowClick}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    )

    const row = screen.getByRole('button', { name: /Ada Partner/ })
    const [edit, remove] = screen.getAllByRole('button').filter((button) => button !== row)

    await user.click(edit)
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'p-1' }))
    expect(onRowClick).not.toHaveBeenCalled()

    await user.click(remove)
    expect(onDelete).toHaveBeenCalledOnce()
    expect(onRowClick).not.toHaveBeenCalled()

    row.focus()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')
    expect(onRowClick).toHaveBeenCalledTimes(2)
  })
})
