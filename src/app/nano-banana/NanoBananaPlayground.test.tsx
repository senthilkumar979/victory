import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { gooeyToast } from 'goey-toast'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('goey-toast', () => ({
  gooeyToast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

import { NanoBananaPlayground } from './NanoBananaPlayground'

const originalFetch = globalThis.fetch
const originalRandomUUID = crypto.randomUUID

beforeEach(() => {
  globalThis.fetch = vi.fn()
  crypto.randomUUID = vi.fn(() => 'pin-1') as typeof crypto.randomUUID
})

afterEach(() => {
  cleanup()
  globalThis.fetch = originalFetch
  crypto.randomUUID = originalRandomUUID
  vi.mocked(gooeyToast.error).mockReset()
})

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

describe('NanoBananaPlayground', () => {
  it('does not call generate for whitespace-only prompts', async () => {
    const user = userEvent.setup()
    render(<NanoBananaPlayground />)

    const prompt = screen.getByLabelText('Image prompt')
    await user.type(prompt, '   ')
    expect(screen.getByRole('button', { name: 'Generate' })).toBeDisabled()

    await user.type(prompt, '{Enter}')
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('maps quota and safety API failures to distinct toasts', async () => {
    const user = userEvent.setup()
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce(
        jsonResponse({ error: 'Too many images', code: 'quota' }, 429),
      )
      .mockResolvedValueOnce(
        jsonResponse({ error: 'Blocked prompt', code: 'safety' }, 422),
      )

    render(<NanoBananaPlayground />)
    const prompt = screen.getByLabelText('Image prompt')

    await user.type(prompt, 'coffee shop')
    await user.click(screen.getByRole('button', { name: 'Generate' }))

    await waitFor(() => {
      expect(gooeyToast.error).toHaveBeenCalledWith(
        'Rate limit or quota',
        expect.objectContaining({ description: 'Too many images' }),
      )
    })

    await user.click(screen.getByRole('button', { name: 'Generate' }))
    await waitFor(() => {
      expect(gooeyToast.error).toHaveBeenCalledWith(
        'Safety filter',
        expect.objectContaining({ description: 'Blocked prompt' }),
      )
    })
  })

  it('prepends a generated pin and rejects payloads without an image', async () => {
    const user = userEvent.setup()
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce(jsonResponse({}))
      .mockResolvedValueOnce(
        jsonResponse({ imageBase64: 'abc123', mimeType: 'image/png' }),
      )

    render(<NanoBananaPlayground />)
    const prompt = screen.getByLabelText('Image prompt')
    await user.type(prompt, 'rainy street')
    await user.click(screen.getByRole('button', { name: 'Generate' }))

    await waitFor(() => {
      expect(gooeyToast.error).toHaveBeenCalledWith(
        'Invalid response from server',
      )
    })
    expect(
      screen.getByText(/Your generated images will appear here/),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Generate' }))
    await waitFor(() => {
      expect(screen.getByAltText('')).toHaveAttribute(
        'src',
        'data:image/png;base64,abc123',
      )
    })
    expect(screen.getByText('rainy street')).toBeInTheDocument()
    expect(
      screen.queryByText(/Your generated images will appear here/),
    ).not.toBeInTheDocument()
  })
})
