'use client'

import { Breadcrumbs } from '@/atoms/breadcrumbs/Breadcrumbs'
import { NodeDrawer } from '@/components/roadmap/NodeDrawer'
import { RoadmapCanvas } from '@/components/roadmap/RoadmapCanvas'
import {
  getRoadmap,
  type RoadmapNodeData,
} from '@/data/roadmaps'
import { useRoadmapProgress } from '@/hooks/useRoadmapProgress'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import type { Node } from 'reactflow'

export default function RoadmapSlugPage() {
  const params = useParams()
  const slug = typeof params?.slug === 'string' ? params.slug : ''
  const roadmap = getRoadmap(slug)

  const [selectedNode, setSelectedNode] =
    useState<Node<RoadmapNodeData> | null>(null)
  const { completedNodes, markComplete } = useRoadmapProgress(slug)

  const handleNodeClick = (node: Node<RoadmapNodeData>) => {
    setSelectedNode(node)
  }

  const handleClose = () => {
    setSelectedNode(null)
  }

  const handleComplete = (node: Node<RoadmapNodeData>) => {
    markComplete(node.id)
    setSelectedNode(null)
  }

  if (!roadmap) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-muted bg-secondary p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            Roadmap not found
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            The roadmap &quot;{slug}&quot; does not exist. Try TypeScript, React, or
            Node.
          </p>
          <Link
            href="/roadmap/typescript"
            className="text-sm font-medium text-primary hover:underline"
          >
            View TypeScript Roadmap →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-full px-2 py-3">
      <div className="flex flex-row items-center justify-between">
        <Breadcrumbs
          items={[
            { label: 'Roadmaps', href: '/roadmap' },
            { label: roadmap.title },
          ]}
        />
      </div>
      <h1 className="text-2xl font-semibold text-primary text-center">
          {roadmap.title}
        </h1>
      <RoadmapCanvas
        nodes={roadmap.nodes}
        edges={roadmap.edges}
        completedNodes={completedNodes}
        onNodeClick={handleNodeClick}
      />
      <NodeDrawer
        node={selectedNode}
        onClose={handleClose}
        onComplete={handleComplete}
      />
    </div>
  )
}
