import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PartnerFormFields } from './PartnerFormFields'
import {
  partnerFormSchema,
  type PartnerFormValues,
} from './partnerFormSchema'

const defaultValues: PartnerFormValues = {
  name: '',
  company: '',
  location: '',
  category: '',
  primaryEmail: '',
  primaryContact: '',
  secondaryEmail: '',
  secondaryContact: '',
  designation: '',
  description: '',
}

function PartnerFormTestHarness({
  isOpen = true,
  onValidSubmit,
}: {
  isOpen?: boolean
  onValidSubmit: (data: PartnerFormValues) => void
}) {
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues,
  })
  const { reset, handleSubmit } = form

  useEffect(() => {
    if (!isOpen) return
    reset(defaultValues)
  }, [isOpen, reset])

  if (!isOpen) return null

  return (
    <>
      <form id="partner-form" onSubmit={handleSubmit(onValidSubmit)}>
        <PartnerFormFields formId="partner-form" form={form} />
      </form>
      <button type="submit" form="partner-form">
        Save
      </button>
    </>
  )
}

afterEach(() => {
  cleanup()
})

describe('PartnerFormFields', () => {
  it('submits filled values from controlled FormInput fields', async () => {
    const user = userEvent.setup()
    const onValidSubmit = vi.fn()

    render(<PartnerFormTestHarness onValidSubmit={onValidSubmit} />)

    await user.type(screen.getByPlaceholderText('Partner name'), 'Jane Doe')
    await user.type(screen.getByPlaceholderText('Company name'), 'Acme Corp')
    await user.type(
      screen.getByPlaceholderText('e.g. City, Country'),
      'Chennai, India',
    )
    await user.type(
      screen.getAllByPlaceholderText('Phone or other contact')[0],
      '+91 98765 43210',
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(onValidSubmit).toHaveBeenCalledTimes(1)
    })

    expect(onValidSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Jane Doe',
        company: 'Acme Corp',
        location: 'Chennai, India',
        primaryContact: '+91 98765 43210',
      }),
      expect.anything(),
    )
  })

  it('submits values after drawer remount with external submit button', async () => {
    const user = userEvent.setup()
    const onValidSubmit = vi.fn()

    const { rerender } = render(
      <PartnerFormTestHarness isOpen={false} onValidSubmit={onValidSubmit} />,
    )

    rerender(
      <PartnerFormTestHarness isOpen={true} onValidSubmit={onValidSubmit} />,
    )

    await user.type(screen.getByPlaceholderText('Partner name'), 'Reset test')
    await user.type(screen.getByPlaceholderText('Company name'), 'Test Co')
    await user.type(
      screen.getByPlaceholderText('e.g. City, Country'),
      'Bangalore',
    )
    await user.type(
      screen.getAllByPlaceholderText('Phone or other contact')[0],
      '+91 99999 11111',
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(onValidSubmit).toHaveBeenCalledTimes(1)
    })

    expect(onValidSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Reset test',
        company: 'Test Co',
        location: 'Bangalore',
        primaryContact: '+91 99999 11111',
      }),
      expect.anything(),
    )
  })
})
