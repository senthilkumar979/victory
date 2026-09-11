import { describe, expect, it } from 'vitest'

import {
  getInterviewPrepSlugForRoadmap,
  getInterviewTrack,
  isInterviewTrackSlug,
  listInterviewTracks,
} from './index'

describe('interview prep track lookup', () => {
  it('resolves known slugs and rejects unknown ones', () => {
    expect(isInterviewTrackSlug('javascript')).toBe(true)
    expect(isInterviewTrackSlug('java')).toBe(false)
    expect(getInterviewTrack('javascript')?.slug).toBe('javascript')
    expect(getInterviewTrack('java')).toBeUndefined()
    expect(getInterviewTrack('')).toBeUndefined()
  })

  it('maps roadmap slugs onto the interview-prep subset', () => {
    expect(getInterviewPrepSlugForRoadmap('java')).toBe('core-java')
    expect(getInterviewPrepSlugForRoadmap('javascript')).toBe('javascript')
    expect(getInterviewPrepSlugForRoadmap('react')).toBe('react')
    expect(getInterviewPrepSlugForRoadmap('spring-boot')).toBe('spring-boot')
    expect(getInterviewPrepSlugForRoadmap('typescript')).toBe('typescript')
    expect(getInterviewPrepSlugForRoadmap('unknown')).toBeUndefined()
  })

  it('lists every registered track exactly once', () => {
    const tracks = listInterviewTracks()
    expect(tracks.map((t) => t.slug)).toEqual([
      'core-java',
      'javascript',
      'react',
      'spring-boot',
      'typescript',
    ])
    expect(new Set(tracks.map((t) => t.slug)).size).toBe(tracks.length)
  })
})
