import { cleanup, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Blog } from '@/types/blog.types'

import { AppContext } from '../app/contexts/AppContext'
import { useStudentBlogs } from './useStudentBlogs'

const { getBlogsByStudentMock } = vi.hoisted(() => ({
  getBlogsByStudentMock: vi.fn(),
}))

vi.mock('@/lib/blogService', () => ({
  getBlogsByStudent: getBlogsByStudentMock,
}))

const dispatch = vi.fn()

function wrapper({ children }: { children: ReactNode }) {
  return (
    <AppContext.Provider
      value={{ repositories: [], blogs: [], awards: [], dispatch }}
    >
      {children}
    </AppContext.Provider>
  )
}

const mediumBlog: Blog = {
  id: 'b1',
  title: 'On Ada',
  author_name: 'Ada',
  published_date: '2026-01-01',
  cover_image_url: 'https://cdn-images-1.medium.com/max/800/ada.png',
  link: 'https://medium.com/@ada/on-ada',
  username: 'ada',
}

afterEach(() => {
  cleanup()
})

describe('useStudentBlogs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    getBlogsByStudentMock.mockResolvedValue([])
  })

  it('does not fetch when both medium username and author name are missing', async () => {
    const { result } = renderHook(() => useStudentBlogs(undefined, ''), {
      wrapper,
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(getBlogsByStudentMock).not.toHaveBeenCalled()
    expect(result.current.blogs).toEqual([])
    expect(dispatch).not.toHaveBeenCalled()
  })

  it('keeps Medium CDN covers and nulls every other cover URL', async () => {
    const raw: Blog[] = [
      mediumBlog,
      {
        ...mediumBlog,
        id: 'b2',
        cover_image_url: 'https://images.unsplash.com/photo.png',
      },
      { ...mediumBlog, id: 'b3', cover_image_url: null },
    ]
    getBlogsByStudentMock.mockResolvedValue(raw)

    const { result } = renderHook(() => useStudentBlogs('ada', 'Ada'), {
      wrapper,
    })
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(getBlogsByStudentMock).toHaveBeenCalledWith('ada', 'Ada')
    expect(result.current.blogs.map((blog) => blog.cover_image_url)).toEqual([
      'https://cdn-images-1.medium.com/max/800/ada.png',
      null,
      null,
    ])
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_BLOGS',
      payload: raw,
    })
  })

  it('surfaces a non-Error rejection as the generic fallback', async () => {
    getBlogsByStudentMock.mockRejectedValue({ message: 'timeout' })

    const { result } = renderHook(() => useStudentBlogs('ada'), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Failed to fetch blogs')
    expect(result.current.blogs).toEqual([])
    expect(dispatch).not.toHaveBeenCalled()
  })
})
