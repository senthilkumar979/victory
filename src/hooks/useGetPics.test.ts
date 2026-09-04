import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useGetPics } from './useGetPics'

function jsonResponse(ok: boolean, body: unknown): Response {
  return { ok, json: async () => body } as Response
}

const imageA = {
  id: 'a1',
  src: 'https://cdn.example/a.jpg',
  title: 'A',
  alt: 'A',
  public_id: 'a1',
  width: 10,
  height: 10,
  folder: '',
}

const imageB = {
  ...imageA,
  id: 'b1',
  src: 'https://cdn.example/b.jpg',
  public_id: 'b1',
}

const twoFolderOptions = {
  folders: ['My Folder', 'next'],
  maxResults: 7,
  transformation: 'f_auto,q_auto',
}

const skipFolderOptions = {
  folders: ['bad', 'errored', 'offline', 'good'],
}

const emptyFolderOptions = {
  folders: ['empty', 'fail'],
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('useGetPics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('encodes folder query params and waits 100ms before the next folder', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(true, { images: [imageA] }))
      .mockResolvedValueOnce(jsonResponse(true, { images: [imageB] }))

    const { result } = renderHook(() => useGetPics(twoFolderOptions))

    await act(async () => {
      await Promise.resolve()
    })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(
      '/api/cloudinary/images?folder=My%20Folder&max_results=7&transformation=f_auto%2Cq_auto',
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(99)
    })
    expect(fetch).toHaveBeenCalledTimes(1)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(result.current.images).toEqual([
      { ...imageA, folder: 'My Folder' },
      { ...imageB, folder: 'next' },
    ])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.loadingProgress.completedFolders).toEqual([
      'My Folder',
      'next',
    ])
  })

  it('skips failed folders and keeps images from successful ones', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(false, { error: 'denied' }))
      .mockResolvedValueOnce(jsonResponse(true, { error: 'search failed' }))
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(jsonResponse(true, { images: [imageA] }))

    const { result } = renderHook(() => useGetPics(skipFolderOptions))

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(result.current.images).toEqual([{ ...imageA, folder: 'good' }])
    expect(result.current.error).toBeNull()
    expect(result.current.loadingProgress.completedFolders).toEqual(['good'])
    expect(result.current.isLoading).toBe(false)
  })

  it('sets a fetch error when every folder yields no images', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(true, { images: [] }))
      .mockResolvedValueOnce(jsonResponse(false, {}))

    const { result } = renderHook(() => useGetPics(emptyFolderOptions))

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(result.current.images).toEqual([])
    expect(result.current.error).toBe(
      'There is something went wrong while fetching images',
    )
  })
})
