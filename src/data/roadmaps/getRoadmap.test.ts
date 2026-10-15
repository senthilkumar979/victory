import { describe, expect, it } from 'vitest'

import { getRoadmap, ROADMAP_SLUGS, ROADMAPS } from './index'

describe('getRoadmap', () => {
  it('resolves every published slug to that roadmap and its nodes', () => {
    expect(ROADMAP_SLUGS.length).toBe(Object.keys(ROADMAPS).length)

    for (const slug of ROADMAP_SLUGS) {
      const roadmap = getRoadmap(slug)

      expect(roadmap, slug).not.toBeNull()
      expect(roadmap).toBe(ROADMAPS[slug])
      expect(roadmap?.nodes.length).toBeGreaterThan(0)
      expect(roadmap?.title.trim().length).toBeGreaterThan(0)
    }
  })

  it('returns null for unknown, blank, and differently cased slugs', () => {
    expect(getRoadmap('cobol')).toBeNull()
    expect(getRoadmap('')).toBeNull()
    expect(getRoadmap('Java')).toBeNull()
    expect(getRoadmap('JAVA')).toBeNull()
    expect(getRoadmap('spring_boot')).toBeNull()
    expect(getRoadmap(' typescript')).toBeNull()
    expect(getRoadmap('typescript ')).toBeNull()
  })
})
