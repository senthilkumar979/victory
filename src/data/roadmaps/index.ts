import { reactRoadmap } from './react';
import type { RoadmapData } from './types';

export { ROADMAP_META } from './meta';
export { reactRoadmap } from './react';
export * from './types';

export const ROADMAPS: Record<string, RoadmapData> = {
  react: reactRoadmap,
}

export type RoadmapSlug = 'react'
export const ROADMAP_SLUGS: RoadmapSlug[] = ['react']

export const getRoadmap = (slug: string): RoadmapData | null =>
  ROADMAPS[slug] ?? null
