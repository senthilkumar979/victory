import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FormMultiInputTag } from './FormMultiInputTag'

afterEach(() => {
  cleanup()
})

describe('FormMultiInputTag', () => {
  it('removes an enabled tag and keeps the raw label', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()

    render(<FormMultiInputTag text=" React " onRemove={onRemove} />)

    const button = screen.getByRole('button', { name: 'Remove React' })
    expect(button).toHaveAttribute('aria-label', 'Remove  React ')
    expect(button.parentElement?.firstChild?.textContent).toBe(' React ')

    await user.click(button)
    expect(onRemove).toHaveBeenCalledOnce()
  })

  it('disables removal without trimming the tag text', () => {
    render(<FormMultiInputTag text="React" onRemove={vi.fn()} disabled />)

    const button = screen.getByRole('button', { name: 'Remove React' })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('cursor-not-allowed')
  })
})
