import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  CONTENTSQUARE_SRC,
  canLoadContentsquareTag,
  ContentSquareScript,
} from './ContentSquareScript'

vi.mock('next/script', () => ({
  default: ({ src }: { src: string }) => (
    <div data-testid="contentsquare-script" data-src={src} />
  ),
}))

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('canLoadContentsquareTag', () => {
  it('is true in a DOM runtime that exposes Location', () => {
    expect(canLoadContentsquareTag()).toBe(true)
  })

  it('is false when the Location constructor is missing', () => {
    vi.stubGlobal('Location', undefined)
    expect(canLoadContentsquareTag()).toBe(false)
  })
})

describe('ContentSquareScript', () => {
  it('injects the tag after mount when Location exists', async () => {
    render(<ContentSquareScript />)

    const script = await screen.findByTestId('contentsquare-script')
    expect(script).toHaveAttribute('data-src', CONTENTSQUARE_SRC)
  })

  it('does not inject the tag when Location is missing', async () => {
    vi.stubGlobal('Location', undefined)
    render(<ContentSquareScript />)

    await waitFor(() => {
      expect(screen.queryByTestId('contentsquare-script')).not.toBeInTheDocument()
    })
  })
})
