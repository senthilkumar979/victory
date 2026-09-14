import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { BlogFilter } from './BlogFilter'

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
  motion: {
    div: ({ children, ...props }: { children?: ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
}))

const authors = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper']

afterEach(() => {
  cleanup()
})

describe('BlogFilter', () => {
  it('wraps keyboard highlight and selects View all writers on Enter', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<BlogFilter authors={authors} value={null} onChange={onChange} />)

    const input = screen.getByRole('combobox', { name: 'Find a writer' })
    await user.type(input, 'a')

    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(3)
    expect(options[0]).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(options[2]).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowDown}')
    expect(options[0]).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('wraps ArrowUp from the first option to the last matching author', async () => {
    const user = userEvent.setup()
    render(<BlogFilter authors={authors} value={null} onChange={vi.fn()} />)

    await user.type(screen.getByRole('combobox', { name: 'Find a writer' }), 'a')

    const options = screen.getAllByRole('option')
    await user.keyboard('{ArrowUp}')
    expect(options[2]).toHaveAttribute('aria-selected', 'true')
  })

  it('selects the highlighted author on Enter', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<BlogFilter authors={authors} value={null} onChange={onChange} />)

    await user.type(screen.getByRole('combobox', { name: 'Find a writer' }), 'a')
    await user.keyboard('{ArrowDown}{Enter}')

    expect(onChange).toHaveBeenCalledWith('Ada Lovelace')
  })

  it('clears the selected author from the search control', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <BlogFilter authors={authors} value="Grace Hopper" onChange={onChange} />,
    )

    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('closes the list when clicking outside', async () => {
    const user = userEvent.setup()
    render(<BlogFilter authors={authors} value={null} onChange={vi.fn()} />)

    await user.click(screen.getByRole('combobox', { name: 'Find a writer' }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('does not open suggestions when disabled', async () => {
    const user = userEvent.setup()
    render(
      <BlogFilter
        authors={authors}
        value={null}
        onChange={vi.fn()}
        disabled
      />,
    )

    const input = screen.getByRole('combobox', { name: 'Find a writer' })
    expect(input).toBeDisabled()
    await user.click(input)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
