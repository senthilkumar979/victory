import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useSendEmailWithTemplate } from './useSendEmailWithTemplate'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('useSendEmailWithTemplate', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('posts the payload and records the returned email id', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'email-1' }),
    } as Response)

    const { result } = renderHook(() => useSendEmailWithTemplate())
    const payload = {
      to: ['a@example.com', 'b@example.com'],
      templateId: 'tmpl-1',
      variables: { subject: 'Hello' },
      cc: 'cc@example.com',
    }

    await act(async () => {
      await result.current.sendEmail(payload)
    })

    expect(fetch).toHaveBeenCalledWith('/api/email/send-with-template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    expect(result.current.lastEmailId).toBe('email-1')
    expect(result.current.error).toBeNull()
    expect(result.current.isSending).toBe(false)
  })

  it('throws the API error string and stores it', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Template missing' }),
    } as Response)

    const { result } = renderHook(() => useSendEmailWithTemplate())
    let thrown: unknown

    await act(async () => {
      try {
        await result.current.sendEmail({
          to: 'a@example.com',
          templateId: 'tmpl-1',
        })
      } catch (err) {
        thrown = err
      }
    })

    expect(thrown).toEqual(expect.objectContaining({ message: 'Template missing' }))
    expect(result.current.error?.message).toBe('Template missing')
    expect(result.current.lastEmailId).toBeUndefined()
    expect(result.current.isSending).toBe(false)
  })

  it('uses the generic failure message when the API omits error', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({}),
    } as Response)

    const { result } = renderHook(() => useSendEmailWithTemplate())
    let thrown: unknown

    await act(async () => {
      try {
        await result.current.sendEmail({
          to: 'a@example.com',
          templateId: 'tmpl-1',
        })
      } catch (err) {
        thrown = err
      }
    })

    expect(thrown).toEqual(expect.objectContaining({ message: 'Failed to send email' }))
  })

  it('wraps unexpected non-Error throws', async () => {
    vi.mocked(fetch).mockRejectedValue('boom')

    const { result } = renderHook(() => useSendEmailWithTemplate())
    let thrown: unknown

    await act(async () => {
      try {
        await result.current.sendEmail({
          to: 'a@example.com',
          templateId: 'tmpl-1',
        })
      } catch (err) {
        thrown = err
      }
    })

    expect(thrown).toEqual(
      expect.objectContaining({ message: 'Unexpected error while sending email' }),
    )
  })
})
