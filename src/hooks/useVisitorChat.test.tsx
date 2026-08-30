import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { VISITOR_CHAT_MAX_MESSAGE_CHARS } from '@/lib/visitorChatLimits'
import { VISITOR_CHAT_GENERIC_ERROR } from '@/lib/visitorChatClientError'
import { useVisitorChat } from './useVisitorChat'

const { loadMock, saveMock } = vi.hoisted(() => ({
  loadMock: vi.fn(),
  saveMock: vi.fn(),
}))

vi.mock('@/lib/visitorChatStorage', () => ({
  loadVisitorChatMessages: loadMock,
  saveVisitorChatMessages: saveMock,
  VISITOR_CHAT_WELCOME_MESSAGE: {
    role: 'assistant',
    content: 'Welcome!',
  },
}))

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('useVisitorChat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    loadMock.mockReturnValue(null)
    vi.stubGlobal('fetch', vi.fn())
  })

  it('seeds the welcome message when storage is empty', async () => {
    const { result } = renderHook(() => useVisitorChat())

    await waitFor(() => expect(result.current.hydrated).toBe(true))

    expect(result.current.messages).toEqual([
      { role: 'assistant', content: 'Welcome!' },
    ])
    expect(saveMock).toHaveBeenCalledWith([
      { role: 'assistant', content: 'Welcome!' },
    ])
  })

  it('ignores blank messages and rejects oversized input without fetching', async () => {
    const { result } = renderHook(() => useVisitorChat())
    await waitFor(() => expect(result.current.hydrated).toBe(true))

    await act(async () => {
      await result.current.sendUserMessage('   ')
    })
    expect(fetch).not.toHaveBeenCalled()

    await act(async () => {
      await result.current.sendUserMessage(
        'x'.repeat(VISITOR_CHAT_MAX_MESSAGE_CHARS + 1),
      )
    })

    expect(fetch).not.toHaveBeenCalled()
    expect(result.current.error).toMatch(/too long/i)
    expect(result.current.messages).toHaveLength(1)
  })

  it('appends the assistant reply on success', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ reply: 'We run weekly sessions.' }),
    } as Response)

    const { result } = renderHook(() => useVisitorChat())
    await waitFor(() => expect(result.current.hydrated).toBe(true))

    await act(async () => {
      await result.current.sendUserMessage('  What do you offer?  ')
    })

    expect(fetch).toHaveBeenCalledWith('/api/visitor-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'assistant', content: 'Welcome!' },
          { role: 'user', content: 'What do you offer?' },
        ],
      }),
    })
    expect(result.current.messages.at(-1)).toEqual({
      role: 'assistant',
      content: 'We run weekly sessions.',
    })
    expect(result.current.error).toBeNull()
  })

  it('rolls back the user turn when the API fails or omits a reply', async () => {
    const { result } = renderHook(() => useVisitorChat())
    await waitFor(() => expect(result.current.hydrated).toBe(true))

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'invalid message payload' }),
    } as Response)

    await act(async () => {
      await result.current.sendUserMessage('Hello')
    })

    expect(result.current.messages).toEqual([
      { role: 'assistant', content: 'Welcome!' },
    ])
    expect(result.current.error).toBe(VISITOR_CHAT_GENERIC_ERROR)

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response)

    await act(async () => {
      await result.current.sendUserMessage('Hello again')
    })

    expect(result.current.messages).toEqual([
      { role: 'assistant', content: 'Welcome!' },
    ])
    expect(result.current.error).toBe(VISITOR_CHAT_GENERIC_ERROR)
  })

  it('ignores a second send while a request is in flight', async () => {
    let resolveFetch: (value: Response) => void = () => {}
    vi.mocked(fetch).mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveFetch = resolve
      }),
    )

    const { result } = renderHook(() => useVisitorChat())
    await waitFor(() => expect(result.current.hydrated).toBe(true))

    let firstSend: Promise<void> = Promise.resolve()
    act(() => {
      firstSend = result.current.sendUserMessage('First')
    })

    await waitFor(() => expect(result.current.isSending).toBe(true))

    await act(async () => {
      await result.current.sendUserMessage('Second')
    })
    expect(fetch).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolveFetch({
        ok: true,
        json: async () => ({ reply: 'Done' }),
      } as Response)
      await firstSend
    })

    expect(result.current.messages.map((m) => m.content)).toEqual([
      'Welcome!',
      'First',
      'Done',
    ])
  })
})
