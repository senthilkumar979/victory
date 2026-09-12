import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { gooeyToast } from 'goey-toast'

import { useContactUsForm } from './useContactUsForm'

vi.mock('goey-toast', () => ({
  gooeyToast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

const valid = {
  fullName: 'Ada Lovelace',
  company: 'Analytical Engines',
  email: 'ada@example.com',
  message: 'Hello from the contact form',
}

afterEach(() => {
  cleanupFetch()
  vi.mocked(gooeyToast.error).mockReset()
  vi.mocked(gooeyToast.success).mockReset()
})

let originalFetch: typeof fetch

beforeEach(() => {
  originalFetch = globalThis.fetch
})

function cleanupFetch() {
  globalThis.fetch = originalFetch
}

describe('useContactUsForm', () => {
  it('resets the form after a successful send', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as typeof fetch

    const { result } = renderHook(() => useContactUsForm())

    await act(async () => {
      result.current.setValue('fullName', valid.fullName)
      result.current.setValue('company', valid.company)
      result.current.setValue('email', valid.email)
      result.current.setValue('message', valid.message)
    })

    await act(async () => {
      await result.current.onSubmit(valid)
    })

    expect(gooeyToast.success).toHaveBeenCalledWith(
      'Message sent',
      expect.objectContaining({}),
    )
    expect(result.current.getValues()).toEqual({
      fullName: '',
      company: '',
      email: '',
      message: '',
    })
  })

  it('uses the API error string, then the generic fallback when JSON is missing', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Inbox is full' }),
    }) as typeof fetch

    const { result } = renderHook(() => useContactUsForm())

    await act(async () => {
      await result.current.onSubmit(valid)
    })

    const firstDescription = vi.mocked(gooeyToast.error).mock.calls[0]?.[1] as {
      description: { props: { children: string } }
    }
    expect(firstDescription.description.props.children).toBe('Inbox is full')

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error('not json')
      },
    }) as typeof fetch

    await act(async () => {
      await result.current.onSubmit(valid)
    })

    await waitFor(() => {
      const last = vi.mocked(gooeyToast.error).mock.calls.at(-1)?.[1] as {
        description: { props: { children: string } }
      }
      expect(last.description.props.children).toBe(
        'Please try again in a moment.',
      )
    })
  })
})
