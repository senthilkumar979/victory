import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('motion/react', () => ({
  motion: {
    div: function MotionDiv({
      children,
      className,
    }: {
      children?: ReactNode
      className?: string
    }) {
      return <div className={className}>{children}</div>
    },
  },
}))

vi.mock('goey-toast', () => ({
  gooeyToast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

import { ContactUsForm } from './ContactUsForm'

const originalFetch = globalThis.fetch

beforeEach(() => {
  globalThis.fetch = vi.fn()
})

afterEach(() => {
  cleanup()
  globalThis.fetch = originalFetch
})

describe('ContactUsForm', () => {
  it('shows schema errors and allows an empty company', async () => {
    const user = userEvent.setup()
    render(<ContactUsForm />)

    await user.click(screen.getByRole('button', { name: /Submit/ }))

    expect(await screen.findByText('Full name is required')).toBeInTheDocument()
    expect(screen.getByText('Message is required')).toBeInTheDocument()
    expect(screen.getByText('Enter a valid email')).toBeInTheDocument()
    expect(
      screen.queryByText(/company is required/i),
    ).not.toBeInTheDocument()
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('disables submit while the request is in flight', async () => {
    const user = userEvent.setup()
    let resolveFetch: ((value: Response) => void) | undefined
    vi.mocked(globalThis.fetch).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )

    render(<ContactUsForm />)

    await user.type(screen.getByPlaceholderText('Kumar'), 'Ada Lovelace')
    await user.type(screen.getByPlaceholderText('kumar@abc.com'), 'ada@ex.com')
    await user.type(
      screen.getByPlaceholderText('Type your message here'),
      'Hello from the form',
    )
    await user.click(screen.getByRole('button', { name: /Submit/ }))

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/contact',
        expect.objectContaining({ method: 'POST' }),
      )
      expect(screen.getByRole('button')).toBeDisabled()
    })

    resolveFetch?.({
      ok: true,
      json: async () => ({}),
    } as Response)
  })
})
