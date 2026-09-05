import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'

const { successMock, errorMock } = vi.hoisted(() => ({
  successMock: vi.fn(),
  errorMock: vi.fn(),
}))

vi.mock('goey-toast', () => ({
  gooeyToast: {
    success: (...args: unknown[]) => successMock(...args),
    error: (...args: unknown[]) => errorMock(...args),
  },
}))

vi.mock('@/ui/organisms/modal/Modal', () => {
  const Modal = ({
    isOpen,
    children,
  }: {
    isOpen: boolean
    children: ReactNode
  }) => (isOpen ? <div role="dialog">{children}</div> : null)
  function Title({ children }: { children: ReactNode }) {
    return <h2>{children}</h2>
  }
  function Body({ children }: { children: ReactNode }) {
    return <div>{children}</div>
  }
  function Footer({ children }: { children: ReactNode }) {
    return <div>{children}</div>
  }
  Modal.Title = Title
  Modal.Body = Body
  Modal.Footer = Footer
  return { Modal }
})

import { InviteStudent } from './InviteStudent'

afterEach(() => {
  cleanup()
})

describe('InviteStudent', () => {
  beforeEach(() => {
    successMock.mockReset()
    errorMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('does not send when the single email is empty or whitespace', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    render(<InviteStudent show onClose={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Send invitation' })).toBeDisabled()

    await user.type(screen.getByPlaceholderText('e.g. student@example.com'), '   ')
    expect(screen.getByRole('button', { name: 'Send invitation' })).toBeDisabled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('trims a single email and posts it to the invitations API', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSuccess = vi.fn()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<InviteStudent show onClose={onClose} onSuccess={onSuccess} />)

    await user.type(
      screen.getByPlaceholderText('e.g. student@example.com'),
      '  ada@example.com  ',
    )
    await user.click(screen.getByRole('button', { name: 'Send invitation' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/invitations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailAddress: 'ada@example.com' }),
      })
    })
    expect(successMock).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalled()
  })

  it('surfaces the API error string, then a fallback message', async () => {
    const user = userEvent.setup()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Already invited' }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      })
    vi.stubGlobal('fetch', fetchMock)

    render(<InviteStudent show onClose={vi.fn()} />)

    await user.type(
      screen.getByPlaceholderText('e.g. student@example.com'),
      'ada@example.com',
    )
    await user.click(screen.getByRole('button', { name: 'Send invitation' }))
    await waitFor(() => {
      expect(errorMock).toHaveBeenCalledWith(
        'Already invited',
        expect.any(Object),
      )
    })

    await user.click(screen.getByRole('button', { name: 'Send invitation' }))
    await waitFor(() => {
      expect(errorMock).toHaveBeenCalledWith(
        'Failed to send invitation',
        expect.any(Object),
      )
    })
    expect(successMock).not.toHaveBeenCalled()
  })

  it('continues bulk invites after a failure and still closes on completion', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSuccess = vi.fn()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'denied' }),
      })
    vi.stubGlobal('fetch', fetchMock)

    render(<InviteStudent show onClose={onClose} onSuccess={onSuccess} />)

    await user.click(screen.getByRole('button', { name: 'Bulk' }))
    await user.type(
      screen.getByPlaceholderText(/student1@example.com/),
      'one@example.com\nbad@example.com',
    )
    await user.click(screen.getByRole('button', { name: /Send invitations \(2\)/ }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })
    expect(successMock).toHaveBeenCalledWith(
      '1 invitation sent.',
      expect.objectContaining({
        description: expect.anything(),
      }),
    )
    expect(onClose).toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalled()
  })
})
