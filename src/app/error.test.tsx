import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import AppError from './error'

const { captureException } = vi.hoisted(() => ({
  captureException: vi.fn(),
}))

vi.mock('@sentry/nextjs', () => ({
  captureException,
}))

describe('AppError', () => {
  afterEach(() => {
    cleanup()
    captureException.mockReset()
  })

  it('reports the route error and retries when asked', async () => {
    const reset = vi.fn()
    const error = Object.assign(new Error('profile failed'), { digest: 'abc' })

    const { rerender } = render(<AppError error={error} reset={reset} />)

    expect(
      screen.getByRole('heading', { name: 'Something went wrong' }),
    ).toBeInTheDocument()
    await waitFor(() => expect(captureException).toHaveBeenCalledWith(error))

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(reset).toHaveBeenCalledTimes(1)

    const nextError = new Error('again')
    rerender(<AppError error={nextError} reset={reset} />)

    await waitFor(() =>
      expect(captureException).toHaveBeenLastCalledWith(nextError),
    )
    expect(captureException).toHaveBeenCalledTimes(2)
  })
})
