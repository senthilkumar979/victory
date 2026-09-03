import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Blog } from '@/types/blog.types'

import { useBlogs } from './useBlogs'

const {
  getAuthorsMock,
  getBlogsHeroMock,
  getBlogsRemainingMock,
} = vi.hoisted(() => ({
  getAuthorsMock: vi.fn(),
  getBlogsHeroMock: vi.fn(),
  getBlogsRemainingMock: vi.fn(),
}))

vi.mock('@/lib/blogService', () => ({
  getAuthors: getAuthorsMock,
  getBlogsHero: getBlogsHeroMock,
  getBlogsRemaining: getBlogsRemainingMock,
}))

function blog(id: string): Blog {
  return {
    id,
    title: `Post ${id}`,
    author_name: 'Ada',
    published_date: '2026-01-01',
    cover_image_url: null,
    link: `https://medium.com/@ada/${id}`,
    username: 'ada',
  }
}

afterEach(() => {
  cleanup()
})

describe('useBlogs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    getAuthorsMock.mockResolvedValue(['Ada', 'Grace'])
    getBlogsHeroMock.mockResolvedValue({ data: [], totalCount: 0 })
    getBlogsRemainingMock.mockResolvedValue({
      data: [],
      totalRemainingPages: 1,
    })
  })

  it('splits the hero payload into featured and next5 and skips remaining when total is 10 or less', async () => {
    const hero = Array.from({ length: 8 }, (_, index) => blog(`h${index}`))
    getBlogsHeroMock.mockResolvedValue({ data: hero, totalCount: 8 })

    const { result } = renderHook(() => useBlogs())
    await waitFor(() => expect(result.current.heroLoading).toBe(false))

    expect(getBlogsHeroMock).toHaveBeenCalledWith(undefined)
    expect(result.current.featured.map((item) => item.id)).toEqual(
      hero.slice(0, 5).map((item) => item.id),
    )
    expect(result.current.next5.map((item) => item.id)).toEqual(
      hero.slice(5, 10).map((item) => item.id),
    )
    expect(result.current.totalCount).toBe(8)
    expect(result.current.remaining).toEqual([])
    expect(result.current.totalRemainingPages).toBe(1)
    expect(getBlogsRemainingMock).not.toHaveBeenCalled()
  })

  it('loads remaining pages only after more than 10 blogs exist', async () => {
    getBlogsHeroMock.mockResolvedValue({
      data: Array.from({ length: 10 }, (_, index) => blog(`h${index}`)),
      totalCount: 25,
    })
    getBlogsRemainingMock.mockResolvedValue({
      data: [blog('r1')],
      totalRemainingPages: 1,
    })

    const { result } = renderHook(() => useBlogs())
    await waitFor(() => expect(result.current.remaining).toEqual([blog('r1')]))

    expect(getBlogsRemainingMock).toHaveBeenCalledWith({
      page: 1,
      authorName: undefined,
    })
    expect(result.current.totalRemainingPages).toBe(1)
  })

  it('resets remaining pagination when the author filter changes and swallows remaining errors', async () => {
    getBlogsHeroMock.mockResolvedValue({
      data: Array.from({ length: 10 }, (_, index) => blog(`h${index}`)),
      totalCount: 30,
    })
    getBlogsRemainingMock
      .mockResolvedValueOnce({ data: [blog('r1')], totalRemainingPages: 2 })
      .mockRejectedValueOnce({ message: 'timeout' })
      .mockResolvedValue({ data: [blog('r2')], totalRemainingPages: 1 })

    const { result } = renderHook(() => useBlogs())
    await waitFor(() => expect(result.current.remaining[0]?.id).toBe('r1'))

    await act(async () => {
      result.current.setRemainingPage(2)
    })
    await waitFor(() => expect(getBlogsRemainingMock).toHaveBeenCalledTimes(2))
    expect(result.current.error).toBeNull()
    expect(result.current.remaining[0]?.id).toBe('r1')

    await act(async () => {
      result.current.setAuthorFilter('Ada')
    })
    await waitFor(() => expect(result.current.remainingPage).toBe(1))
    await waitFor(() => expect(result.current.remaining[0]?.id).toBe('r2'))

    expect(getBlogsHeroMock).toHaveBeenLastCalledWith('Ada')
    expect(getBlogsRemainingMock).toHaveBeenLastCalledWith({
      page: 1,
      authorName: 'Ada',
    })
  })

  it('surfaces a non-Error hero failure as the generic fallback', async () => {
    getBlogsHeroMock.mockRejectedValue({ message: 'timeout' })

    const { result } = renderHook(() => useBlogs())
    await waitFor(() => expect(result.current.heroLoading).toBe(false))

    expect(result.current.error).toBe('Failed to fetch blogs')
    expect(result.current.featured).toEqual([])
    expect(result.current.next5).toEqual([])
  })
})
