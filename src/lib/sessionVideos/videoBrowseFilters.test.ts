import { describe, expect, it } from 'vitest'

import type { SessionVideo } from '@/types/sessionVideo.types'
import { SESSION_VIDEO_CATEGORIES } from '@/lib/sessionVideos/sessionVideoCategories'

import {
  DEFAULT_VIDEO_BROWSE_FILTERS,
  filterSessionVideos,
  getVideoBrowseView,
  isVideoBrowseFilterActive,
} from './videoBrowseFilters'

function video(
  overrides: Partial<SessionVideo> & Pick<SessionVideo, 'id' | 'title'>,
): SessionVideo {
  return {
    youtubeUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeVideoId: 'dQw4w9WgXcQ',
    category: SESSION_VIDEO_CATEGORIES.REACT_SESSION,
    isFeatured: false,
    viewCount: 10,
    createdBy: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

const catalog = [
  video({
    id: '1',
    title: 'React Hooks Deep Dive',
    category: SESSION_VIDEO_CATEGORIES.REACT_SESSION,
    viewCount: 100,
    createdAt: '2026-03-01T00:00:00.000Z',
    isFeatured: true,
  }),
  video({
    id: '2',
    title: 'Intro to React',
    category: SESSION_VIDEO_CATEGORIES.REACT_SESSION,
    viewCount: 50,
    createdAt: '2026-04-01T00:00:00.000Z',
  }),
  video({
    id: '3',
    title: 'Java Streams',
    category: SESSION_VIDEO_CATEGORIES.JAVA_SESSION,
    viewCount: 200,
    createdAt: '2026-02-01T00:00:00.000Z',
  }),
]

describe('isVideoBrowseFilterActive', () => {
  it('is inactive for defaults and active once any filter changes', () => {
    expect(isVideoBrowseFilterActive(DEFAULT_VIDEO_BROWSE_FILTERS)).toBe(false)
    expect(
      isVideoBrowseFilterActive({
        ...DEFAULT_VIDEO_BROWSE_FILTERS,
        query: '  react ',
      }),
    ).toBe(true)
    expect(
      isVideoBrowseFilterActive({
        ...DEFAULT_VIDEO_BROWSE_FILTERS,
        category: SESSION_VIDEO_CATEGORIES.JAVA_SESSION,
      }),
    ).toBe(true)
    expect(
      isVideoBrowseFilterActive({
        ...DEFAULT_VIDEO_BROWSE_FILTERS,
        sort: 'views',
      }),
    ).toBe(true)
  })
})

describe('filterSessionVideos', () => {
  it('filters by query and category, then sorts by views', () => {
    const results = filterSessionVideos(catalog, {
      query: 'react',
      category: SESSION_VIDEO_CATEGORIES.REACT_SESSION,
      sort: 'views',
    })

    expect(results.map((item) => item.id)).toEqual(['1', '2'])
  })

  it('prefers title prefix matches when sorting by relevance with a query', () => {
    const results = filterSessionVideos(catalog, {
      query: 'react',
      category: 'all',
      sort: 'relevance',
    })

    expect(results.map((item) => item.id)).toEqual(['1', '2'])
    expect(results[0]?.title.toLowerCase().startsWith('react')).toBe(true)
  })

  it('sorts by newest createdAt when requested', () => {
    const results = filterSessionVideos(catalog, {
      query: '',
      category: 'all',
      sort: 'newest',
    })

    expect(results.map((item) => item.id)).toEqual(['2', '1', '3'])
  })
})

describe('getVideoBrowseView', () => {
  it('returns search results when filters are active', () => {
    const view = getVideoBrowseView(catalog, {
      query: 'java',
      category: 'all',
      sort: 'relevance',
    })

    expect(view.mode).toBe('search')
    if (view.mode === 'search') {
      expect(view.results.map((item) => item.id)).toEqual(['3'])
    }
  })

  it('returns browse sections without repeating the featured video', () => {
    const view = getVideoBrowseView(catalog, DEFAULT_VIDEO_BROWSE_FILTERS)

    expect(view.mode).toBe('browse')
    if (view.mode === 'browse') {
      expect(view.featured?.id).toBe('1')
      expect(view.mostViewed.some((item) => item.id === '1')).toBe(false)
      expect(view.recent.some((item) => item.id === '1')).toBe(false)
    }
  })
})
