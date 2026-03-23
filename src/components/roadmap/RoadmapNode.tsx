'use client'

import type { RoadmapNodeMeta } from '@/data/roadmaps'
import { Check } from 'lucide-react'
import { Handle, Position, type NodeProps } from 'reactflow'

export interface RoadmapNodeDataWithCompletion extends RoadmapNodeMeta {
  isCompleted?: boolean
}

const defaultClasses =
  'min-w-[180px] rounded-xl border-2 border-white bg-secondary px-2 py-2 shadow-sm'
const completedClasses =
  'min-w-[180px] rounded-xl border-2 border-green-700 bg-success px-2 py-2 shadow-sm'

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
          className={`text-sm flex items-center gap-2 font-medium ${
            isCompleted ? 'text-white' : 'text-foreground'
          }`}
        >
          {isCompleted ? <Check className="w-4 h-4" /> : ''}
          {data.title}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} className="invisible" />
    </>
  )
}
