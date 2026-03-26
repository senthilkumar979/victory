import { javascriptRoadmap } from './javascript';
import { javaRoadmap } from './java';
import { reactRoadmap } from './react';
import { springBootRoadmap } from './spring-boot';
import type { RoadmapData } from './types';
import { typescriptRoadmap } from './typescript';

export { ROADMAP_META } from './meta';
export { javascriptRoadmap } from './javascript';
export { javaRoadmap } from './java';
export { reactRoadmap } from './react';
export { springBootRoadmap } from './spring-boot';
export { typescriptRoadmap } from './typescript';
export * from './types';

export const ROADMAPS: Record<string, RoadmapData> = {
  react: reactRoadmap,
  typescript: typescriptRoadmap,
  javascript: javascriptRoadmap,
  java: javaRoadmap,
  'spring-boot': springBootRoadmap,
}

export type RoadmapSlug = 'react' | 'typescript' | 'javascript' | 'java' | 'spring-boot'
export const ROADMAP_SLUGS: RoadmapSlug[] = ['react', 'typescript', 'javascript', 'java', 'spring-boot']

export const getRoadmap = (slug: string): RoadmapData | null =>
  ROADMAPS[slug] ?? null
