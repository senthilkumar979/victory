'use client'

import { Handle, Position, type NodeProps } from 'reactflow'
import type { RoadmapNodeData } from '@/data/roadmaps'

export interface RoadmapNodeDataWithCompletion extends RoadmapNodeData {
  isCompleted?: boolean
}

const defaultClasses =
  'min-w-[180px] rounded-xl border-2 border-muted bg-secondary px-4 py-3 shadow-sm'
const completedClasses =
  'min-w-[180px] rounded-xl border-2 border-green-700 bg-green-500 px-4 py-3 shadow-sm'

export const RoadmapNode = ({
  data,
  selected,
}: NodeProps<RoadmapNodeDataWithCompletion>) => {
  const isCompleted = data.isCompleted ?? false
  const baseClasses = isCompleted ? completedClasses : defaultClasses
  const selectedClasses = selected ? 'ring-2 ring-primary ring-offset-2' : ''

  return (
    <>
      <Handle type="target" position={Position.Top} className="invisible" />
      <div
        className={`${baseClasses} ${selectedClasses} text-center transition-colors`}
      >
        <span
          className={`text-sm font-medium ${
            isCompleted ? 'text-white' : 'text-foreground'
          }`}
        >
          {data.label}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} className="invisible" />
    </>
  )
}
