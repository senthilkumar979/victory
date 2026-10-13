import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import GlobalError from './global-error'

const { captureException } = vi.hoisted(() => ({
  captureException: vi.fn(),
}))

vi.mock('@sentry/nextjs', () => ({
  captureException,
}))

vi.mock('next/error', () => ({
  default: function NextError({ statusCode }: { statusCode: number }) {
    return <p>Error status {statusCode}</p>
  },
}))

describe('GlobalError', () => {
  afterEach(() => {
    cleanup()
    captureException.mockReset()
  })

  it('reports a root error without a status page code', async () => {
    const error = Object.assign(new Error('root failed'), { digest: 'root' })

    render(<GlobalError error={error} />)

    expect(screen.getByText('Error status 0')).toBeInTheDocument()
    await waitFor(() => expect(captureException).toHaveBeenCalledWith(error))
  })
})
