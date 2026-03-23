import { Braces, Zap } from "lucide-react"
import { RoadmapSlug } from "."

export const ROADMAP_META: Record<
  RoadmapSlug,
  {
    id: string,
    description: string
    accent: string
    icon: React.ComponentType<{ className?: string }>
    gradient: string
  }
> = {
  react: {
    id: 'react',
    description: 'Components, hooks, and the React ecosystem.',
    accent: 'text-cyan-400',
    icon: Zap,
    gradient:
      'from-cyan-500/20 via-teal-500/10 to-transparent border border-cyan-500/30',
  },
  typescript: {
    id: 'typescript',
    description: 'Types, generics, and advanced type-level programming.',
    accent: 'text-blue-400',
    icon: Braces,
    gradient:
      'from-blue-500/20 via-indigo-500/10 to-transparent border border-blue-500/30',
  },
}