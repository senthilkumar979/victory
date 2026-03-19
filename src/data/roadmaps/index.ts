import { reactRoadmap } from './react'
import type { RoadmapData } from './types'

export { ROADMAP_META } from './meta'
export { nodeRoadmap } from './node'
export { reactRoadmap } from './react'
export * from './types'
export { typescriptRoadmap } from './typescript'

export const ROADMAPS: Record<string, RoadmapData> = {
  react: reactRoadmap,
}

export type RoadmapSlug = 'typescript' | 'react' | 'node'
export const ROADMAP_SLUGS: RoadmapSlug[] = ['react']

export const getRoadmap = (slug: string): RoadmapData | null =>
  ROADMAPS[slug] ?? null
