import { javascriptRoadmap } from './javascript';
import { reactRoadmap } from './react';
import type { RoadmapData } from './types';
import { typescriptRoadmap } from './typescript';

export { ROADMAP_META } from './meta';
export { javascriptRoadmap } from './javascript';
export { reactRoadmap } from './react';
export { typescriptRoadmap } from './typescript';
export * from './types';

export const ROADMAPS: Record<string, RoadmapData> = {
  react: reactRoadmap,
  typescript: typescriptRoadmap,
  javascript: javascriptRoadmap,
}

export type RoadmapSlug = 'react' | 'typescript' | 'javascript'
export const ROADMAP_SLUGS: RoadmapSlug[] = ['react', 'typescript', 'javascript']

export const getRoadmap = (slug: string): RoadmapData | null =>
  ROADMAPS[slug] ?? null
