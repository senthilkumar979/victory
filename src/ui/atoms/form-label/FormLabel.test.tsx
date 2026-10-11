import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { FormLabel } from './FormLabel'

afterEach(() => {
  cleanup()
})

describe('FormLabel', () => {
  it('renders the label text without a required marker', () => {
    render(<FormLabel htmlFor="title">Title</FormLabel>)

    const label = screen.getByText('Title')
    expect(label.tagName).toBe('LABEL')
    expect(label).toHaveAttribute('for', 'title')
    expect(label.querySelector('span')).toBeNull()
    expect(label).not.toHaveClass('text-white')
  })

  it('appends a required asterisk and the dark-mode color', () => {
    render(
      <FormLabel htmlFor="email" isRequired isDarkMode>
        Email
      </FormLabel>,
    )

    const label = screen.getByText(/Email/)
    const marker = label.querySelector('span')

    expect(label).toHaveAttribute('for', 'email')
    expect(label).toHaveClass('text-white')
    expect(marker).toHaveTextContent('*')
    expect(marker).toHaveClass('text-red-500')
  })
})
