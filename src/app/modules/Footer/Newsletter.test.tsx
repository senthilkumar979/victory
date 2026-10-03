import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Newsletter } from './Newsletter'

const { successToast, errorToast } = vi.hoisted(() => ({
  successToast: vi.fn(),
  errorToast: vi.fn(),
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
  },
}))

vi.mock('goey-toast', () => ({
  gooeyToast: {
    success: successToast,
    error: errorToast,
  },
}))

describe('Newsletter', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  async function subscribe(email: string): Promise<void> {
    cleanup()
    const user = userEvent.setup()
    render(<Newsletter />)
    if (email) {
      await user.type(screen.getByPlaceholderText('you@example.com'), email)
    }
    await user.click(screen.getByRole('button', { name: 'Subscribe' }))
  }

  it('does not send when the address is empty or missing a domain', async () => {
    await subscribe('')
    await subscribe('   ')
    await subscribe('ada@mentorbridge')
    await subscribe('not an email')

    expect(fetchMock).not.toHaveBeenCalled()
    expect(errorToast).toHaveBeenCalledTimes(4)
    expect(errorToast).toHaveBeenCalledWith(
      'Invalid email',
      expect.objectContaining({ description: expect.anything() }),
    )
    expect(successToast).not.toHaveBeenCalled()
  })

  it('posts a valid subscription and clears the field', async () => {
    fetchMock.mockResolvedValue({ ok: true })

    await subscribe('ada@mentorbridge.in')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/email/send')
    expect(init.method).toBe('POST')
    expect(JSON.parse(String(init.body))).toEqual({
      to: 'senthilkumar@mentorbridge.in',
      subject: 'Newsletter Subscription',
      html: '<p>Someone has subscribed to the newsletter. Email: ada@mentorbridge.in</p>',
    })
    expect(successToast).toHaveBeenCalledWith(
      'Subscribed to newsletter',
      expect.objectContaining({ description: expect.anything() }),
    )
    expect(screen.getByPlaceholderText('you@example.com')).toHaveValue('')
  })

  it('keeps the address and reports failure when the request is not ok', async () => {
    fetchMock.mockResolvedValue({ ok: false })

    await subscribe('ada@mentorbridge.in')

    expect(errorToast).toHaveBeenCalledWith(
      'Failed to subscribe to newsletter',
      expect.objectContaining({ description: expect.anything() }),
    )
    expect(successToast).not.toHaveBeenCalled()
    expect(screen.getByPlaceholderText('you@example.com')).toHaveValue(
      'ada@mentorbridge.in',
    )
  })
})
