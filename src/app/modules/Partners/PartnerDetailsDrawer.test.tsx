import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { PartnerFormState } from './Partner.types'
import { PartnerDetailsDrawer } from './PartnerDetailsDrawer'

vi.mock('@/ui/organisms/drawer/Drawer', () => {
  function DrawerRoot({ children }: { children: unknown }) {
    return <section>{children}</section>
  }
  function DrawerTitle({
    children,
    description,
  }: {
    children: unknown
    description?: string
  }) {
    return (
      <header>
        <h2>{children}</h2>
        {description ? <p>{description}</p> : null}
      </header>
    )
  }
  function DrawerBody({ children }: { children: unknown }) {
    return <div>{children}</div>
  }
  function DrawerFooter({ children }: { children: unknown }) {
    return <footer>{children}</footer>
  }
  DrawerRoot.Title = DrawerTitle
  DrawerRoot.Body = DrawerBody
  DrawerRoot.Footer = DrawerFooter
  return { Drawer: DrawerRoot }
})

function makePartner(
  overrides: Partial<PartnerFormState> = {},
): PartnerFormState {
  return {
    id: 'p-1',
    name: 'Priya',
    company: 'Acme',
    location: 'Chennai',
    primaryEmail: 'priya@acme.com',
    primaryContact: '9000000000',
    secondaryEmail: '',
    secondaryContact: '',
    designation: 'CTO',
    category: 'Hiring',
    description: '',
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('PartnerDetailsDrawer', () => {
  it('shows em dashes for empty required fields and hides optional blanks', () => {
    render(
      <PartnerDetailsDrawer
        isOpen
        partner={makePartner({
          location: '',
          designation: '',
          category: '',
        })}
        onClose={vi.fn()}
        onEdit={vi.fn()}
      />,
    )

    expect(screen.getAllByText('Priya').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Acme').length).toBeGreaterThan(0)
    expect(screen.queryByText('Secondary email')).not.toBeInTheDocument()
    expect(screen.queryByText('Secondary contact')).not.toBeInTheDocument()
    expect(screen.queryByText('Description')).not.toBeInTheDocument()
    expect(screen.getAllByText('—')).toHaveLength(3)
  })

  it('does not edit when no partner is loaded, and closes before edit when one is', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onEdit = vi.fn()
    const partner = makePartner({
      secondaryEmail: 'ops@acme.com',
      secondaryContact: '9000000001',
      description: 'Campus hiring partner',
    })

    const { rerender } = render(
      <PartnerDetailsDrawer
        isOpen
        partner={null}
        onClose={onClose}
        onEdit={onEdit}
      />,
    )

    expect(screen.getByText('Partner details')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()

    rerender(
      <PartnerDetailsDrawer
        isOpen
        partner={partner}
        onClose={onClose}
        onEdit={onEdit}
      />,
    )

    expect(screen.getByText('Secondary email')).toBeInTheDocument()
    expect(screen.getByText('ops@acme.com')).toBeInTheDocument()
    expect(screen.getByText('Campus hiring partner')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /edit/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onEdit).toHaveBeenCalledWith(partner)
    expect(onClose.mock.invocationCallOrder[0]).toBeLessThan(
      onEdit.mock.invocationCallOrder[0],
    )
  })
})
