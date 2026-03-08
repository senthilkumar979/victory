'use client'

import type { MouseEvent as ReactMouseEvent } from 'react'
import type { Node, Edge } from 'reactflow'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from 'reactflow'
import { useCallback, useMemo } from 'react'
import { ROADMAP_NODE_TYPE } from '@/data/roadmaps'
import { RoadmapNode } from './RoadmapNode'

interface RoadmapCanvasProps<T> {
  nodes: Node<T>[]
  edges: Edge[]
  completedNodes?: string[]
  onNodeClick?: (node: Node<T>) => void
}

const nodeTypes = { [ROADMAP_NODE_TYPE]: RoadmapNode }

export const RoadmapCanvas = <T,>({
  nodes,
  edges,
  completedNodes = [],
  onNodeClick,
}: RoadmapCanvasProps<T>) => {
  const completedSet = useMemo(
    () => new Set(completedNodes),
    [completedNodes]
  )

  const styledNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isCompleted: completedSet.has(node.id),
        },
      })),
    [nodes, completedSet]
  )

  const handleNodeClick = useCallback(
    (_event: ReactMouseEvent, node: Node<T>) => onNodeClick?.(node),
    [onNodeClick]
  )

  return (
    <div className="w-full h-[800px] rounded-lg border border-muted overflow-hidden">
      <ReactFlow
        nodes={styledNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        className="bg-background"
        minZoom={0.1}
        maxZoom={2}
      >
        <Background
          variant={BackgroundVariant.Lines}
          gap={16}
          size={1}
          className="text-muted"
        />
        <Controls className="rounded border border-muted bg-secondary shadow-sm" />
        <MiniMap
          className="rounded border border-muted bg-secondary"
          nodeColor="var(--primary)"
          maskColor="rgba(0, 0, 0, 0.6)"
        />
      </ReactFlow>
    </div>
  )
}
