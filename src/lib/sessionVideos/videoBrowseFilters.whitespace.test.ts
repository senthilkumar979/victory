import { describe, expect, it } from 'vitest'

import type { SessionVideo } from '@/types/sessionVideo.types'

import { SESSION_VIDEO_CATEGORIES } from './sessionVideoCategories'
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
    youtubeUrl: 'https://youtu.be/aaaaaaaaaaa',
    youtubeVideoId: 'aaaaaaaaaaa',
    category: SESSION_VIDEO_CATEGORIES.GENERAL_SESSION,
    isFeatured: false,
    viewCount: 0,
    createdBy: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

const catalog = [
  video({
    id: 'older',
    title: 'Older talk',
    createdAt: '2026-01-01T00:00:00.000Z',
    viewCount: 1,
  }),
  video({
    id: 'newer',
    title: 'React hooks',
    createdAt: '2026-05-01T00:00:00.000Z',
    viewCount: 9,
    category: SESSION_VIDEO_CATEGORIES.REACT_SESSION,
  }),
]

describe('video browse whitespace and case', () => {
  it('treats a whitespace-only query as the default browse view', () => {
    const filters = { ...DEFAULT_VIDEO_BROWSE_FILTERS, query: ' \n\t ' }

    expect(isVideoBrowseFilterActive(filters)).toBe(false)

    const view = getVideoBrowseView(catalog, filters)
    expect(view.mode).toBe('browse')

    expect(
      filterSessionVideos(catalog, {
        ...filters,
        sort: 'relevance',
      }).map((item) => item.id),
    ).toEqual(['newer', 'older'])
  })

  it('matches a trimmed query without caring about case', () => {
    const results = filterSessionVideos(catalog, {
      query: '  REACT ',
      category: 'all',
      sort: 'relevance',
    })

    expect(results.map((item) => item.id)).toEqual(['newer'])
    expect(
      getVideoBrowseView(catalog, {
        ...DEFAULT_VIDEO_BROWSE_FILTERS,
        query: '  REACT ',
      }).mode,
    ).toBe('search')
  })
})
