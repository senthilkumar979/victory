import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FormMultiInput } from './FormMultiInput'

function Harness({
  initial = [],
  maxTags,
  validationStatus,
  errorMessage,
  onChange,
}: {
  initial?: string[]
  maxTags?: number
  validationStatus?: 'default' | 'valid' | 'invalid'
  errorMessage?: string
  onChange?: (value: string[]) => void
}) {
  const [value, setValue] = useState(initial)

  return (
    <FormMultiInput
      label="Skills"
      value={value}
      maxTags={maxTags}
      validationStatus={validationStatus}
      errorMessage={errorMessage}
      helperText="Separate skills with commas"
      onChange={(next) => {
        onChange?.(next)
        setValue(next)
      }}
    />
  )
}

afterEach(() => {
  cleanup()
})

describe('FormMultiInput', () => {
  it('commits trimmed tags on comma and Enter and drops duplicates', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)

    await user.type(
      screen.getByPlaceholderText('Type and press comma to add'),
      ' React , react, React{Enter}',
    )

    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getAllByText('React')).toHaveLength(1)
    expect(onChange).toHaveBeenLastCalledWith(['React', 'react'])
  })

  it('ignores whitespace-only commits', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)

    await user.type(
      screen.getByPlaceholderText('Type and press comma to add'),
      '   ,{Enter}',
    )

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: /Remove/ })).not.toBeInTheDocument()
  })

  it('stops typed tags once maxTags is reached', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Harness initial={['A']} maxTags={2} onChange={onChange} />)

    await user.type(screen.getByRole('textbox'), 'B, C,')

    expect(onChange).toHaveBeenLastCalledWith(['A', 'B'])
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('keeps only the tags that still fit when a comma list is pasted', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Harness initial={['A']} maxTags={2} onChange={onChange} />)

    await user.click(screen.getByRole('textbox'))
    await user.paste('B, C, D')

    expect(onChange).toHaveBeenLastCalledWith(['A', 'B'])
    expect(screen.queryByText('C')).not.toBeInTheDocument()
  })

  it('pastes a comma list onto the current draft and skips existing tags', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Harness initial={['React']} onChange={onChange} />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'Type')
    await user.paste('Script, React, CSS')

    expect(onChange).toHaveBeenLastCalledWith(['React', 'TypeScript', 'CSS'])
    expect(input).toHaveValue('')
  })

  it('removes the last tag on Backspace only when the draft is empty', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Harness initial={['A', 'B']} onChange={onChange} />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'x{Backspace}')
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByText('B')).toBeInTheDocument()

    await user.type(input, '{Backspace}')
    expect(onChange).toHaveBeenLastCalledWith(['A'])
    expect(screen.queryByText('B')).not.toBeInTheDocument()
  })

  it('removes a single tag from its button and shows invalid errors', async () => {
    const user = userEvent.setup()
    render(
      <Harness
        initial={['React', 'CSS']}
        validationStatus="invalid"
        errorMessage="Add at least one skill"
      />,
    )

    expect(screen.getByText('Separate skills with commas')).toBeInTheDocument()
    expect(screen.getByText('Add at least one skill')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')

    await user.click(screen.getByRole('button', { name: 'Remove React' }))

    expect(screen.queryByText('React')).not.toBeInTheDocument()
    expect(screen.getByText('CSS')).toBeInTheDocument()
  })
})
