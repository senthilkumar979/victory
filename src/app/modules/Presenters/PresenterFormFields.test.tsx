import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { zodResolver } from '@hookform/resolvers/zod'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useForm } from 'react-hook-form'

import { PresenterFormFields } from './PresenterFormFields'
import {
  presenterFormSchema,
  type PresenterFormValues,
} from './presenterFormSchema'

vi.mock('@/molecules/user-search/UserSearch', () => ({
  UserSearch: ({
    onSelect,
    placeholder,
  }: {
    onSelect: (student: { email: string }) => void
    placeholder: string
  }) => (
    <button
      type="button"
      onClick={() => onSelect({ email: 'presenter@example.com' })}
    >
      {placeholder}
    </button>
  ),
}))

vi.mock('@/molecules/calendar', () => ({
  CalendarInput: ({
    id,
    label,
    onChange,
    value,
  }: {
    id: string
    label: string
    onChange: (value: string) => void
    value: string
  }) => (
    <label htmlFor={id}>
      {label}
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  ),
}))

interface PresenterFormTestHarnessProps {
  defaultValues?: PresenterFormValues
  onValidSubmit: (data: PresenterFormValues) => void
}

const validDefaultValues: PresenterFormValues = {
  presentedBy: 'presenter@example.com',
  presentedDate: '2026-06-01T12:00:00.000Z',
  topic: '',
}

const PresenterFormTestHarness = ({
  defaultValues = validDefaultValues,
  onValidSubmit,
}: PresenterFormTestHarnessProps) => {
  const form = useForm<PresenterFormValues>({
    resolver: zodResolver(presenterFormSchema),
    defaultValues,
  })

  return (
    <form onSubmit={form.handleSubmit(onValidSubmit)}>
      <PresenterFormFields formId="presenter-form-test" form={form} />
      <button type="submit">Submit</button>
    </form>
  )
}

describe('PresenterFormFields', () => {
  afterEach(() => cleanup())

  it('submits the controlled topic field with schema trimming', async () => {
    const user = userEvent.setup()
    const onValidSubmit = vi.fn()

    render(<PresenterFormTestHarness onValidSubmit={onValidSubmit} />)

    await user.type(
      screen.getByPlaceholderText('Presentation topic...'),
      '  React performance  ',
    )
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(onValidSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        presentedBy: 'presenter@example.com',
        topic: 'React performance',
      }),
      expect.anything(),
    )
  })

  it('surfaces a schema error when topic is empty', async () => {
    const user = userEvent.setup()
    const onValidSubmit = vi.fn()

    render(<PresenterFormTestHarness onValidSubmit={onValidSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByText('Topic is required')).toBeInTheDocument()
    expect(onValidSubmit).not.toHaveBeenCalled()
  })
})
