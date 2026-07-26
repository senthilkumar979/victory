import { describe, expect, it } from 'vitest'

import {
  formatViewCount,
  getYoutubeEmbedUrl,
  getYoutubeThumbnailUrl,
  parseYoutubeVideoId,
} from './youtubeUtils'

describe('parseYoutubeVideoId', () => {
  it('parses watch, short, embed, and shorts urls', () => {
    expect(
      parseYoutubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    ).toBe('dQw4w9WgXcQ')
    expect(parseYoutubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ',
    )
    expect(
      parseYoutubeVideoId('https://m.youtube.com/embed/dQw4w9WgXcQ'),
    ).toBe('dQw4w9WgXcQ')
    expect(
      parseYoutubeVideoId('https://youtube.com/shorts/dQw4w9WgXcQ'),
    ).toBe('dQw4w9WgXcQ')
  })

  it('rejects blank, malformed, and non-youtube urls', () => {
    expect(parseYoutubeVideoId('')).toBeNull()
    expect(parseYoutubeVideoId('   ')).toBeNull()
    expect(parseYoutubeVideoId('not-a-url')).toBeNull()
    expect(parseYoutubeVideoId('https://vimeo.com/123456')).toBeNull()
    expect(
      parseYoutubeVideoId('https://youtube.com/watch?v=short-id'),
    ).toBeNull()
  })
})

describe('youtube url helpers', () => {
  it('builds thumbnail and embed urls for a video id', () => {
    expect(getYoutubeThumbnailUrl('dQw4w9WgXcQ')).toBe(
      'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    )
    expect(getYoutubeEmbedUrl('dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1',
    )
  })

  it('formats view counts for display', () => {
    expect(formatViewCount(1)).toBe('1 view')
    expect(formatViewCount(999)).toBe('999 views')
    expect(formatViewCount(1500)).toBe('1.5K views')
    expect(formatViewCount(2_500_000)).toBe('2.5M views')
  })
})
