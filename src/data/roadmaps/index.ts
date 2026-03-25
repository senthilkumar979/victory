import { javascriptRoadmap } from './javascript';
import { javaRoadmap } from './java';
import { reactRoadmap } from './react';
import type { RoadmapData } from './types';
import { typescriptRoadmap } from './typescript';

export { ROADMAP_META } from './meta';
export { javascriptRoadmap } from './javascript';
export { javaRoadmap } from './java';
export { reactRoadmap } from './react';
export { typescriptRoadmap } from './typescript';
export * from './types';

export const ROADMAPS: Record<string, RoadmapData> = {
  react: reactRoadmap,
  typescript: typescriptRoadmap,
  javascript: javascriptRoadmap,
  java: javaRoadmap,
}

export type RoadmapSlug = 'react' | 'typescript' | 'javascript' | 'java'
export const ROADMAP_SLUGS: RoadmapSlug[] = ['react', 'typescript', 'javascript', 'java']

export const getRoadmap = (slug: string): RoadmapData | null =>
  ROADMAPS[slug] ?? null
