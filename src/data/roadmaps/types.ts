
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
  isCompleted?: boolean
  resources: {
    title: string
    url: string,
    type?: 'video' | 'article' | 'book' | 'course' | 'code' | 'documentation' | 'other'
  }[]
}


export interface RoadmapDetailsProps {
  completedNodes: string[]
  onNodeClick: (id: string) => void
}