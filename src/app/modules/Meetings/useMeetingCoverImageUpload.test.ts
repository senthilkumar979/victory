import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  uploadMeetingCoverImage,
  useMeetingCoverImageUpload,
} from './useMeetingCoverImageUpload'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('uploadMeetingCoverImage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('posts the file and returns the cover image URL', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        coverImageUrl: 'https://cdn.example.com/cover.png',
      }),
    } as Response)

    const file = new File(['cover'], 'cover.png', { type: 'image/png' })
    const url = await uploadMeetingCoverImage('meet/1', file)

    expect(fetch).toHaveBeenCalledWith(
      '/api/meetings/meet%2F1/cover-image/upload',
      expect.objectContaining({ method: 'POST' }),
    )
    const body = vi.mocked(fetch).mock.calls[0]?.[1]?.body as FormData
    expect(body.get('file')).toBe(file)
    expect(url).toBe('https://cdn.example.com/cover.png')
  })

  it('throws the API error when upload fails', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'File too large' }),
    } as Response)

    await expect(
      uploadMeetingCoverImage(
        'm1',
        new File(['x'], 'x.png', { type: 'image/png' }),
      ),
    ).rejects.toThrow('File too large')
  })

  it('throws when the success payload has a blank image URL', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ coverImageUrl: '   ' }),
    } as Response)

    await expect(
      uploadMeetingCoverImage(
        'm1',
        new File(['x'], 'x.png', { type: 'image/png' }),
      ),
    ).rejects.toThrow('Upload succeeded but no image URL was returned')
  })

  it('uses the generic failure message when the error body is not JSON', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error('not json')
      },
    } as Response)

    await expect(
      uploadMeetingCoverImage(
        'm1',
        new File(['x'], 'x.png', { type: 'image/png' }),
      ),
    ).rejects.toThrow('Failed to upload cover image')
  })
})

describe('useMeetingCoverImageUpload', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('returns the uploaded URL and clears error on success', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        coverImageUrl: 'https://cdn.example.com/cover.png',
      }),
    } as Response)

    const { result } = renderHook(() => useMeetingCoverImageUpload())
    const file = new File(['cover'], 'cover.png', { type: 'image/png' })

    let url: string | null = null
    await act(async () => {
      url = await result.current.uploadCoverImage('m1', file)
    })

    expect(url).toBe('https://cdn.example.com/cover.png')
    expect(result.current.error).toBeNull()
    expect(result.current.isUploading).toBe(false)
  })

  it('swallows upload failures into error state and returns null', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Forbidden' }),
    } as Response)

    const { result } = renderHook(() => useMeetingCoverImageUpload())

    let url: string | null = 'pending'
    await act(async () => {
      url = await result.current.uploadCoverImage(
        'm1',
        new File(['x'], 'x.png', { type: 'image/png' }),
      )
    })

    expect(url).toBeNull()
    expect(result.current.error).toBe('Forbidden')
    expect(result.current.isUploading).toBe(false)
  })
})
