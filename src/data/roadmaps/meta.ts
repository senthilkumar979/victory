import { Brackets, Cpu, Zap } from "lucide-react"
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
  typescript: {
    id: 'typescript',
    description: 'Type safety, inference, and modern JavaScript tooling.',
    accent: 'text-blue-400',
    icon: Brackets,
    gradient:
      'from-blue-500/20 via-cyan-500/10 to-transparent border border-blue-500/30',
  },
  react: {
    id: 'react',
    description: 'Components, hooks, and the React ecosystem.',
    accent: 'text-cyan-400',
    icon: Zap,
    gradient:
      'from-cyan-500/20 via-teal-500/10 to-transparent border border-cyan-500/30',
  },
  node: {
    id: 'node',
    description: 'Runtime, async patterns, and server-side JavaScript.',
    accent: 'text-emerald-400',
    icon: Cpu,
    gradient:
      'from-emerald-500/20 via-green-500/10 to-transparent border border-emerald-500/30',
  },
}