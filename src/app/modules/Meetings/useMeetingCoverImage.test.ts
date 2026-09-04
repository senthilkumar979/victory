import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { MeetingFormState } from './Meeting.types'
import { useMeetingCoverImage } from './useMeetingCoverImage'

const { errorToastMock, successToastMock } = vi.hoisted(() => ({
  errorToastMock: vi.fn(),
  successToastMock: vi.fn(),
}))

vi.mock('goey-toast', () => ({
  gooeyToast: {
    error: errorToastMock,
    success: successToastMock,
  },
}))

const meeting: MeetingFormState = {
  id: 'meet/1',
  title: 'Weekly sync',
  date: '2026-06-01T12:00:00.000Z',
  googleGroupId: 'group-1',
  description: 'Discuss progress',
  meetingLink: 'https://meet.example.com/weekly',
  coverImageUrl: '',
}

function jsonResponse(ok: boolean, body: unknown): Response {
  return { ok, json: async () => body } as Response
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('useMeetingCoverImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('skips generate and confirm when the meeting id or preview is missing', async () => {
    const { result } = renderHook(() =>
      useMeetingCoverImage({ ...meeting, id: undefined }, true),
    )

    await act(async () => {
      await result.current.generate()
    })
    expect(fetch).not.toHaveBeenCalled()

    await expect(result.current.confirm()).resolves.toEqual({ ok: false })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('encodes the meeting id, seeds the default prompt, and stores a generated preview', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(true, {
        promptUsed: 'used prompt',
        previewUrl: 'https://cdn.example/preview.png',
        previewPathname: 'previews/meet-1.png',
      }),
    )

    const { result } = renderHook(() => useMeetingCoverImage(meeting, true))

    await waitFor(() => expect(result.current.prompt).toContain('Weekly sync'))

    act(() => result.current.setPrompt('  custom prompt  '))
    await act(async () => {
      await result.current.generate()
    })

    expect(fetch).toHaveBeenCalledWith(
      '/api/meetings/meet%2F1/cover-image/generate',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          userPrompt: 'custom prompt',
          replacePreviewPathname: undefined,
        }),
      }),
    )
    expect(result.current.prompt).toBe('used prompt')
    expect(result.current.previewUrl).toBe('https://cdn.example/preview.png')
    expect(result.current.previewPathname).toBe('previews/meet-1.png')
    expect(result.current.isGenerating).toBe(false)
  })

  it('confirms the preview pathname and maps generate/confirm failures to toasts', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        jsonResponse(true, {
          previewUrl: 'https://cdn.example/preview.png',
          previewPathname: 'previews/meet-1.png',
        }),
      )
      .mockResolvedValueOnce(jsonResponse(false, { error: 'Not authorized' }))
      .mockResolvedValueOnce(jsonResponse(false, {}))
      .mockResolvedValueOnce(jsonResponse(true, {}))

    const { result } = renderHook(() => useMeetingCoverImage(meeting, true))
    await act(async () => {
      await result.current.generate()
    })

    await expect(result.current.confirm()).resolves.toEqual({ ok: false })
    expect(errorToastMock).toHaveBeenCalledWith(
      'Not authorized',
      expect.any(Object),
    )

    await act(async () => {
      await result.current.generate()
    })
    expect(errorToastMock).toHaveBeenCalledWith(
      'Failed to generate image',
      expect.any(Object),
    )

    await expect(result.current.confirm()).resolves.toEqual({ ok: true })
    expect(successToastMock).toHaveBeenCalledWith(
      'Cover image saved for this meeting.',
      expect.objectContaining({ description: 'Weekly sync' }),
    )
    expect(vi.mocked(fetch).mock.calls[3]?.[0]).toBe(
      '/api/meetings/meet%2F1/cover-image/confirm',
    )
    expect(vi.mocked(fetch).mock.calls[3]?.[1]?.body).toBe(
      JSON.stringify({ previewPathname: 'previews/meet-1.png' }),
    )
  })
})
