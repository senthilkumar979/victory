import { describe, expect, it } from 'vitest'

import { formatViewCount, parseYoutubeVideoId } from './youtubeUtils'

const VIDEO_ID = 'dQw4w9WgXcQ'

describe('parseYoutubeVideoId edges', () => {
  it('keeps the id when watch, short, and youtu.be urls carry extra query or path', () => {
    expect(
      parseYoutubeVideoId(
        `https://www.youtube.com/watch?v=${VIDEO_ID}&t=43&list=PLexample`,
      ),
    ).toBe(VIDEO_ID)
    expect(parseYoutubeVideoId(`https://m.youtube.com/watch?v=${VIDEO_ID}`)).toBe(
      VIDEO_ID,
    )
    expect(parseYoutubeVideoId(`https://www.youtube.com/shorts/${VIDEO_ID}`)).toBe(
      VIDEO_ID,
    )
    expect(parseYoutubeVideoId(`https://youtu.be/${VIDEO_ID}?t=43`)).toBe(VIDEO_ID)
    expect(parseYoutubeVideoId(`https://youtube.com/embed/${VIDEO_ID}/`)).toBe(
      VIDEO_ID,
    )
  })

  it('rejects watch urls with a missing or wrong-length id and non-video hosts', () => {
    expect(parseYoutubeVideoId('https://www.youtube.com/watch')).toBeNull()
    expect(parseYoutubeVideoId('https://www.youtube.com/watch?v=')).toBeNull()
    expect(parseYoutubeVideoId('https://www.youtube.com/watch?v=short')).toBeNull()
    expect(
      parseYoutubeVideoId(`https://www.youtube.com/watch?v=${VIDEO_ID}extra`),
    ).toBeNull()
    expect(
      parseYoutubeVideoId(`https://music.youtube.com/watch?v=${VIDEO_ID}`),
    ).toBeNull()
    expect(parseYoutubeVideoId('https://www.youtube.com/playlist?list=PL')).toBeNull()
    expect(parseYoutubeVideoId(`https://youtu.be/${VIDEO_ID.slice(0, 10)}`)).toBeNull()
  })
})

describe('formatViewCount boundaries', () => {
  it('rounds the last count below each suffix into that suffix', () => {
    expect(formatViewCount(999_999)).toBe('1000.0K views')
    expect(formatViewCount(999_950)).toBe('1000.0K views')
    expect(formatViewCount(1_499_999)).toBe('1.5M views')
  })
})
