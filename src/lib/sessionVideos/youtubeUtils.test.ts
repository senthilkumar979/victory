import { describe, expect, it } from 'vitest'

import {
  formatViewCount,
  getYoutubeEmbedUrl,
  getYoutubeThumbnailUrl,
  parseYoutubeVideoId,
} from './youtubeUtils'

describe('parseYoutubeVideoId', () => {
  it('parses watch, short, embed, and mobile hosts', () => {
    expect(
      parseYoutubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    ).toBe('dQw4w9WgXcQ')
    expect(parseYoutubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ',
    )
    expect(
      parseYoutubeVideoId('https://youtube.com/embed/dQw4w9WgXcQ'),
    ).toBe('dQw4w9WgXcQ')
    expect(
      parseYoutubeVideoId('https://m.youtube.com/shorts/dQw4w9WgXcQ'),
    ).toBe('dQw4w9WgXcQ')
  })

  it('trims whitespace and rejects invalid or empty input', () => {
    expect(
      parseYoutubeVideoId('  https://youtu.be/dQw4w9WgXcQ  '),
    ).toBe('dQw4w9WgXcQ')
    expect(parseYoutubeVideoId('')).toBeNull()
    expect(parseYoutubeVideoId('   ')).toBeNull()
    expect(parseYoutubeVideoId('not-a-url')).toBeNull()
    expect(parseYoutubeVideoId('https://youtu.be/short-id')).toBeNull()
    expect(
      parseYoutubeVideoId('https://example.com/watch?v=dQw4w9WgXcQ'),
    ).toBeNull()
  })
})

describe('youtube url helpers', () => {
  it('builds thumbnail and privacy-enhanced embed urls', () => {
    expect(getYoutubeThumbnailUrl('dQw4w9WgXcQ')).toBe(
      'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    )
    expect(getYoutubeEmbedUrl('dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1',
    )
  })
})

describe('formatViewCount', () => {
  it('formats singular, thousands, and millions', () => {
    expect(formatViewCount(0)).toBe('0 views')
    expect(formatViewCount(1)).toBe('1 view')
    expect(formatViewCount(999)).toBe('999 views')
    expect(formatViewCount(1_000)).toBe('1.0K views')
    expect(formatViewCount(1_500)).toBe('1.5K views')
    expect(formatViewCount(1_000_000)).toBe('1.0M views')
    expect(formatViewCount(2_300_000)).toBe('2.3M views')
  })
})
