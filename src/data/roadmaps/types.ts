import type { Node, Edge } from 'reactflow'

export const ROADMAP_NODE_TYPE = 'roadmap' as const

export interface RoadmapNodeData {
  label: string
  description: string
  resources: {
    title: string
    url: string
  }[]
  isCompleted?: boolean
}

export interface RoadmapData {
  title: string
  nodes: Node<RoadmapNodeData>[]
  edges: Edge[]
}
