import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { InviteStudentFormFields } from './InviteStudentFormFields'

afterEach(() => {
  cleanup()
})

describe('InviteStudentFormFields', () => {
  it('stays in single-email mode until Bulk is selected', () => {
    render(
      <InviteStudentFormFields
        mode="single"
        setMode={vi.fn()}
        email="ada@example.com"
        setEmail={vi.fn()}
        bulkText="ignored@example.com"
        setBulkText={vi.fn()}
      />,
    )

    expect(screen.getByPlaceholderText('e.g. student@example.com')).toHaveValue(
      'ada@example.com',
    )
    expect(screen.queryByText(/valid email/)).not.toBeInTheDocument()
  })

  it('counts unique valid bulk emails and ignores junk tokens', async () => {
    const user = userEvent.setup()
    const setMode = vi.fn()
    const setBulkText = vi.fn()

    const { rerender } = render(
      <InviteStudentFormFields
        mode="single"
        setMode={setMode}
        email=""
        setEmail={vi.fn()}
        bulkText=""
        setBulkText={setBulkText}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Bulk' }))
    expect(setMode).toHaveBeenCalledWith('bulk')

    rerender(
      <InviteStudentFormFields
        mode="bulk"
        setMode={setMode}
        email=""
        setEmail={vi.fn()}
        bulkText={'ada@example.com, ADA@example.com; not-an-email\nbob@example.com'}
        setBulkText={setBulkText}
      />,
    )

    expect(screen.getByText('2 valid emails found')).toBeInTheDocument()
  })

  it('uses the singular label for one valid bulk email', () => {
    render(
      <InviteStudentFormFields
        mode="bulk"
        setMode={vi.fn()}
        email=""
        setEmail={vi.fn()}
        bulkText="ada@example.com"
        setBulkText={vi.fn()}
      />,
    )

    expect(screen.getByText('1 valid email found')).toBeInTheDocument()
  })
})
