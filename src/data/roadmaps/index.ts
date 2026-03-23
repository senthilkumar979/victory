import { reactRoadmap } from './react';
import type { RoadmapData } from './types';
import { typescriptRoadmap } from './typescript';

export { ROADMAP_META } from './meta';
export { reactRoadmap } from './react';
export { typescriptRoadmap } from './typescript';
export * from './types';

export const ROADMAPS: Record<string, RoadmapData> = {
  react: reactRoadmap,
  typescript: typescriptRoadmap,
}

export type RoadmapSlug = 'react' | 'typescript'
export const ROADMAP_SLUGS: RoadmapSlug[] = ['react', 'typescript']

export const getRoadmap = (slug: string): RoadmapData | null =>
  ROADMAPS[slug] ?? null
