import type { RoadmapData } from './types'
import { nodeRoadmap } from './node'
import { reactRoadmap } from './react'
import { typescriptRoadmap } from './typescript'

export * from './types'
export { typescriptRoadmap } from './typescript'
export { reactRoadmap } from './react'
export { nodeRoadmap } from './node'

export const ROADMAPS: Record<string, RoadmapData> = {
  typescript: typescriptRoadmap,
  react: reactRoadmap,
  node: nodeRoadmap,
}

export type RoadmapSlug = 'typescript' | 'react' | 'node'
export const ROADMAP_SLUGS: RoadmapSlug[] = ['typescript', 'react', 'node']

export const getRoadmap = (slug: string): RoadmapData | null =>
  ROADMAPS[slug] ?? null
