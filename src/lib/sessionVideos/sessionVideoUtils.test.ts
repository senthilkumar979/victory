import { describe, expect, it } from 'vitest'

import { SESSION_VIDEO_CATEGORIES } from './sessionVideoCategories'
import {
  buildVideoBrowseSections,
  getSimilarVideos,
} from './sessionVideoUtils'
import type { SessionVideo } from '@/types/sessionVideo.types'

function video(
  overrides: Partial<SessionVideo> & Pick<SessionVideo, 'id'>,
): SessionVideo {
  return {
    title: overrides.title ?? overrides.id,
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

describe('getSimilarVideos', () => {
  it('prioritizes the same category and falls back when the current id is missing', () => {
    const videos = [
      video({ id: 'current', category: SESSION_VIDEO_CATEGORIES.REACT_SESSION }),
      video({ id: 'other-cat', category: SESSION_VIDEO_CATEGORIES.JAVA_SESSION }),
      video({ id: 'same-cat', category: SESSION_VIDEO_CATEGORIES.REACT_SESSION }),
    ]

    expect(getSimilarVideos(videos, 'current').map((v) => v.id)).toEqual([
      'same-cat',
      'other-cat',
    ])
    expect(getSimilarVideos(videos, 'missing', 1).map((v) => v.id)).toEqual([
      'current',
    ])
  })
})

describe('buildVideoBrowseSections', () => {
  it('uses the flagged featured video and never repeats a video across sections', () => {
    const mostViewed = Array.from({ length: 12 }, (_, i) =>
      video({
        id: `viewed-${i}`,
        viewCount: 20 - i,
        createdAt: '2026-01-02T00:00:00.000Z',
      }),
    )
    const videos = [
      video({
        id: 'featured',
        isFeatured: true,
        viewCount: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
      ...mostViewed,
      video({
        id: 'newest',
        viewCount: 0,
        createdAt: '2026-06-01T00:00:00.000Z',
        category: SESSION_VIDEO_CATEGORIES.JAVA_SESSION,
      }),
    ]

    const sections = buildVideoBrowseSections(videos)
    const ids = [
      sections.featured?.id,
      ...sections.mostViewed.map((v) => v.id),
      ...sections.recent.map((v) => v.id),
      ...sections.byCategory.flatMap((g) => g.videos.map((v) => v.id)),
    ]

    expect(sections.featured?.id).toBe('featured')
    expect(sections.mostViewed.map((v) => v.id)).toEqual(
      mostViewed.map((v) => v.id),
    )
    expect(sections.recent.map((v) => v.id)).toEqual(['newest'])
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).not.toContain(undefined)
  })

  it('falls back to the most-viewed video when none are flagged featured', () => {
    const sections = buildVideoBrowseSections([
      video({ id: 'low', viewCount: 1 }),
      video({ id: 'high', viewCount: 9 }),
    ])

    expect(sections.featured?.id).toBe('high')
    expect(sections.mostViewed.map((v) => v.id)).toEqual(['low'])
  })
})
