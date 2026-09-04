import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useLinkedInPostDraft } from './useLinkedInPostDraft'

const { errorToastMock } = vi.hoisted(() => ({
  errorToastMock: vi.fn(),
}))

vi.mock('goey-toast', () => ({
  gooeyToast: {
    error: errorToastMock,
    success: vi.fn(),
  },
}))

const draftArgs = {
  contextTitle: 'Weekly sync',
  contextDescription: 'Discuss progress',
  primaryLink: 'https://mentorbridge.in/meetings/1',
  contextExtra: 'Batch 1',
}

function jsonResponse(ok: boolean, body: unknown): Response {
  return { ok, json: async () => body } as Response
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('useLinkedInPostDraft', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('does not generate while closed, then loads commentary when opened', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(true, { commentary: 'Join us this week' }),
    )

    const { result, rerender } = renderHook(
      ({ isOpen }) => useLinkedInPostDraft({ ...draftArgs, isOpen }),
      { initialProps: { isOpen: false } },
    )

    expect(fetch).not.toHaveBeenCalled()

    rerender({ isOpen: true })
    await waitFor(() => expect(result.current.commentary).toBe('Join us this week'))
    expect(fetch).toHaveBeenCalledWith(
      '/api/linkedin/generate-post',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          title: 'Weekly sync',
          description: 'Discuss progress',
          primaryLink: 'https://mentorbridge.in/meetings/1',
          context: 'Batch 1',
        }),
      }),
    )
    expect(result.current.isGenerating).toBe(false)
  })

  it('surfaces generate failures and blocks empty publish', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(false, { error: 'Quota exceeded' }))

    const { result } = renderHook(() =>
      useLinkedInPostDraft({ ...draftArgs, isOpen: true }),
    )

    await waitFor(() => expect(result.current.generateError).toBe('Quota exceeded'))
    expect(errorToastMock).toHaveBeenCalledWith(
      'Quota exceeded',
      expect.any(Object),
    )

    await expect(
      result.current.publish({
        coverImageUrl: 'https://cdn.example/cover.png',
        imageAltText: 'cover',
      }),
    ).resolves.toBe(false)
    expect(errorToastMock).toHaveBeenCalledWith(
      'Post text is empty.',
      expect.any(Object),
    )
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('publishes trimmed commentary and truncates alt text to 400 characters', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(true, { commentary: '  Ship it  ' }))
      .mockResolvedValueOnce(jsonResponse(true, {}))

    const onSuccess = vi.fn()
    const { result } = renderHook(() =>
      useLinkedInPostDraft({ ...draftArgs, isOpen: true }),
    )

    await waitFor(() => expect(result.current.commentary).toBe('  Ship it  '))

    let published = false
    await act(async () => {
      published = await result.current.publish({
        coverImageUrl: 'https://cdn.example/cover.png',
        imageAltText: 'y'.repeat(401),
        onSuccess,
      })
    })

    expect(published).toBe(true)
    expect(onSuccess).toHaveBeenCalledTimes(1)
    const publishBody = JSON.parse(
      String(vi.mocked(fetch).mock.calls[1]?.[1]?.body),
    ) as { commentary: string; imageAltText: string }
    expect(vi.mocked(fetch).mock.calls[1]?.[0]).toBe('/api/linkedin/publish')
    expect(publishBody.commentary).toBe('Ship it')
    expect(publishBody.imageAltText).toHaveLength(400)
    expect(result.current.isPublishing).toBe(false)
  })
})
