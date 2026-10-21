import { describe, expect, it } from 'vitest'

import type { SessionVideo } from '@/types/sessionVideo.types'

import { SESSION_VIDEO_CATEGORIES } from './sessionVideoCategories'
import { buildVideoBrowseSections, getSimilarVideos } from './sessionVideoUtils'

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

describe('session video browse edges', () => {
  it('returns empty sections when the catalog is empty', () => {
    expect(buildVideoBrowseSections([])).toEqual({
      featured: null,
      mostViewed: [],
      recent: [],
      byCategory: [],
    })
  })

  it('keeps the first featured flag and the earlier video on a view-count tie', () => {
    const flagged = buildVideoBrowseSections([
      video({ id: 'first-flag', isFeatured: true, viewCount: 1 }),
      video({ id: 'later-flag', isFeatured: true, viewCount: 50 }),
    ])
    expect(flagged.featured?.id).toBe('first-flag')
    expect(flagged.mostViewed.map((item) => item.id)).toEqual(['later-flag'])

    const tied = buildVideoBrowseSections([
      video({ id: 'earlier', viewCount: 5, createdAt: '2026-01-01T00:00:00.000Z' }),
      video({ id: 'later', viewCount: 5, createdAt: '2026-06-01T00:00:00.000Z' }),
    ])
    expect(tied.featured?.id).toBe('earlier')
    expect(tied.mostViewed.map((item) => item.id)).toEqual(['later'])
  })

  it('drops empty categories and caps a leftover category at 12', () => {
    const mostViewed = Array.from({ length: 12 }, (_, index) =>
      video({
        id: `viewed-${index}`,
        viewCount: 100 - index,
        createdAt: '2020-06-01T00:00:00.000Z',
      }),
    )
    const recent = Array.from({ length: 12 }, (_, index) =>
      video({
        id: `recent-${index}`,
        viewCount: 2,
        category: SESSION_VIDEO_CATEGORIES.JAVA_SESSION,
        createdAt: `2026-03-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`,
      }),
    )
    const storyLab = Array.from({ length: 13 }, (_, index) =>
      video({
        id: `story-${index}`,
        viewCount: 0,
        category: SESSION_VIDEO_CATEGORIES.STORY_LAB,
        createdAt: `2019-01-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`,
      }),
    )

    const sections = buildVideoBrowseSections([
      video({
        id: 'featured',
        isFeatured: true,
        viewCount: 1000,
        createdAt: '2020-01-01T00:00:00.000Z',
      }),
      ...mostViewed,
      ...recent,
      ...storyLab,
    ])

    expect(sections.byCategory.map((group) => group.value)).toEqual([
      SESSION_VIDEO_CATEGORIES.STORY_LAB,
    ])
    expect(sections.byCategory[0]?.videos).toHaveLength(12)
    expect(sections.byCategory[0]?.videos.map((item) => item.id)).not.toContain(
      'story-12',
    )
  })

  it('limits similar videos after same-category matches', () => {
    const videos = [
      video({ id: 'current', category: SESSION_VIDEO_CATEGORIES.REACT_SESSION }),
      video({ id: 'other', category: SESSION_VIDEO_CATEGORIES.JAVA_SESSION }),
      video({ id: 'same-1', category: SESSION_VIDEO_CATEGORIES.REACT_SESSION }),
      video({ id: 'same-2', category: SESSION_VIDEO_CATEGORIES.REACT_SESSION }),
    ]

    expect(getSimilarVideos(videos, 'current', 1).map((item) => item.id)).toEqual([
      'same-1',
    ])
    expect(getSimilarVideos([videos[0]], 'current')).toEqual([])
  })
})
