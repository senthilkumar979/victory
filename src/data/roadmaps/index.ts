import { nodeRoadmap } from './node'
import { reactRoadmap } from './react'
import type { RoadmapData } from './types'
import { typescriptRoadmap } from './typescript'

export { ROADMAP_META } from './meta'
export { nodeRoadmap } from './node'
export { reactRoadmap } from './react'
export * from './types'
export { typescriptRoadmap } from './typescript'

export const ROADMAPS: Record<string, RoadmapData> = {
  typescript: typescriptRoadmap,
  react: reactRoadmap,
  node: nodeRoadmap,
}

export type RoadmapSlug = 'typescript' | 'react' | 'node'
export const ROADMAP_SLUGS: RoadmapSlug[] = ['typescript', 'react', 'node']

export const getRoadmap = (slug: string): RoadmapData | null =>
  ROADMAPS[slug] ?? null
