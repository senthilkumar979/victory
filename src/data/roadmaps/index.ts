import { javascriptRoadmap } from './javascript';
import { javaRoadmap } from './java';
import { reactRoadmap } from './react';
import { springBootRoadmap } from './spring-boot';
import { designThinkingRoadmap } from './design-thinking';
import { storytellingRoadmap } from './storytelling';
import type { RoadmapData } from './types';
import { typescriptRoadmap } from './typescript';

export { ROADMAP_META } from './meta';
export { javascriptRoadmap } from './javascript';
export { javaRoadmap } from './java';
export { reactRoadmap } from './react';
export { springBootRoadmap } from './spring-boot';
export { designThinkingRoadmap } from './design-thinking';
export { storytellingRoadmap } from './storytelling';
export { typescriptRoadmap } from './typescript';
export * from './types';

export const ROADMAPS: Record<string, RoadmapData> = {
  react: reactRoadmap,
  typescript: typescriptRoadmap,
  javascript: javascriptRoadmap,
  java: javaRoadmap,
  'spring-boot': springBootRoadmap,
  storytelling: storytellingRoadmap,
  'design-thinking': designThinkingRoadmap,
}

export type RoadmapSlug = 'react' | 'typescript' | 'javascript' | 'java' | 'spring-boot' | 'storytelling' | 'design-thinking'
export const ROADMAP_SLUGS: RoadmapSlug[] = ['react', 'typescript', 'javascript', 'java', 'spring-boot', 'storytelling', 'design-thinking']

export const getRoadmap = (slug: string): RoadmapData | null =>
  ROADMAPS[slug] ?? null
