'use client'

import 'reactflow/dist/style.css'

import { ROADMAP_NODE_TYPE } from '@/data/roadmaps'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { useCallback, useMemo } from 'react'
import { ReactFlow, type Edge, type Node } from 'reactflow'
import { RoadmapNode } from './RoadmapNode'

interface RoadmapCanvasProps<T> {
  nodes: Node<T>[]
  edges: Edge[]
  completedNodes?: string[]
  onNodeClick?: (node: Node<T>, isCompleted: boolean) => void
}

const nodeTypes = { [ROADMAP_NODE_TYPE]: RoadmapNode }

export const RoadmapCanvas = <T,>({
  nodes,
  edges,
  completedNodes = [],
  onNodeClick,
}: RoadmapCanvasProps<T>) => {
  const completedSet = useMemo(() => new Set(completedNodes), [completedNodes])

  const styledNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isCompleted: completedSet.has(node.id),
        },
      })),
    [nodes, completedSet],
  )

  const handleNodeClick = useCallback(
    (_event: ReactMouseEvent, node: Node<T>) =>
      onNodeClick?.(node, completedSet.has(node.id)),
    [onNodeClick, completedSet],
  )

  return (
    <div className="h-fit" style={{ margin: '0 20%' }}>
      <ReactFlow
        nodes={styledNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ maxZoom: 1 }}
        className="bg-white min-h-[calc(100vh-200px)]"
        zoomOnPinch={false}
        zoomOnScroll={false}
        panOnScroll={false}
        panOnDrag={false}
        nodesDraggable={false}
        selectionOnDrag={false}
        nodesConnectable={false}
        elementsSelectable={false}
        preventScrolling={true}
        snapToGrid={false}
      />
    </div>
  )
}
