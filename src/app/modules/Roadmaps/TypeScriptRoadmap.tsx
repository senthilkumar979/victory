'use client'

import type { RoadmapDetailsProps } from '@/data/roadmaps/types'
import { useCallback } from 'react'

import { TypeScriptRoadmapSvgContent } from './TypeScriptRoadmapSvgContent'

export const TypeScriptRoadmap = ({
  onNodeClick,
  completedNodes = [],
}: RoadmapDetailsProps) => {
  const isCompleted = useCallback(
    (nodeId: string) => completedNodes.includes(nodeId),
    [completedNodes],
  )

  return (
    <TypeScriptRoadmapSvgContent
      isCompleted={isCompleted}
      onNodeClick={onNodeClick}
    />
  )
}
