'use client'

import type { RoadmapDetailsProps } from '@/data/roadmaps/types'
import { useCallback } from 'react'

import { JavaScriptRoadmapSvgContent } from './JavaScriptRoadmapSvgContent'

export const JavaScriptRoadmap = ({
  onNodeClick,
  completedNodes = [],
}: RoadmapDetailsProps) => {
  const isCompleted = useCallback(
    (nodeId: string) => completedNodes.includes(nodeId),
    [completedNodes],
  )

  return (
    <JavaScriptRoadmapSvgContent
      isCompleted={isCompleted}
      onNodeClick={onNodeClick}
    />
  )
}
