
export const ROADMAP_NODE_TYPE = 'roadmap' as const

export interface RoadmapData {
  title: string
  description: string
  nodes: RoadmapNodeMeta[]
}

export interface RoadmapNodeMeta {
  id: string
  title: string
  description: string
  resources: {
    title: string
    url: string
  }[]
  isCompleted?: boolean
}


export interface RoadmapDetailsProps {
  completedNodes: string[]
  onNodeClick: (id: string) => void
}