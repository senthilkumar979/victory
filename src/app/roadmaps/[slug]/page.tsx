'use client'

import { Breadcrumbs } from '@/atoms/breadcrumbs/Breadcrumbs'
import { NodeDrawer } from '@/components/roadmap/NodeDrawer'
import {
  getRoadmap,
  RoadmapDetailsProps,
  RoadmapNodeMeta,
} from '@/data/roadmaps'
import { useRoadmapProgress } from '@/hooks/useRoadmapProgress'
import { ReactRoadmap } from '@/modules/Roadmaps/ReactRoadmap'
import { PageMain } from '@/templates/PagaMain'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export default function RoadmapSlugPage() {
  const params = useParams()
  const slug = typeof params?.slug === 'string' ? params.slug : ''
  const roadmap = (props: RoadmapDetailsProps) => {
    switch (slug) {
      case 'react':
        return <ReactRoadmap {...props} />
      default:
        return null
    }
  }

  const roadmapDetails = getRoadmap(slug)
  console.log(roadmapDetails?.nodes?.map((node) => node.id))

  const [selectedNode, setSelectedNode] = useState<RoadmapNodeMeta | null>(null)
  const {
    completedNodes = [],
    markComplete,
    unmarkComplete,
    isLoading,
    error,
  } = useRoadmapProgress(slug)

  const handleNodeClick = (id: string) => {
    if (!id || !roadmapDetails) return

    const node = roadmapDetails.nodes.find((node) => node.id === id)
    if (!node) return

    setSelectedNode(node)
  }

  const handleClose = () => {
    setSelectedNode(null)
  }

  const handleComplete = (id: string) => {
    markComplete(id)
    setSelectedNode(null)
  }

  const handleIncomplete = (id: string) => {
    unmarkComplete(id)
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
            The roadmap &quot;{slug}&quot; does not exist. Try TypeScript,
            React, or Node.
          </p>
          <Link
            href="/roadmaps/typescript"
            className="text-sm font-medium text-primary hover:underline"
          >
            View TypeScript Roadmap →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <PageMain>
      <div className="mx-auto max-w-full px-2 py-3">
        <div className="flex flex-row items-center justify-between">
          <Breadcrumbs
            items={[
              { label: 'Roadmaps', href: '/roadmaps' },
              { label: roadmapDetails?.title },
            ]}
          />
          {isLoading && (
            <span className="text-sm text-muted-foreground">
              Loading progress…
            </span>
          )}
        </div>
        <h1 className="text-2xl font-semibold text-primary text-center">
          {roadmapDetails?.title}
        </h1>
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive"
          >
            {error}
          </div>
        )}
        <div className="h-fit" style={{ margin: '0 20%' }}>
          {roadmap({
            completedNodes: completedNodes || [],
            onNodeClick: handleNodeClick,
          })}
        </div>
        <NodeDrawer
          node={selectedNode}
          isCompleted={completedNodes.includes(selectedNode?.id || '')}
          onClose={handleClose}
          onComplete={handleComplete}
          onIncomplete={handleIncomplete}
        />
      </div>
    </PageMain>
  )
}
