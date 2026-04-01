import type { RoadmapDetailsProps } from '@/data/roadmaps/types'
import { useCallback } from 'react'
import {
  DT_BRANCHES,
  DT_CX,
  DT_MAIN,
  DT_MAIN_H,
  DT_MAIN_W,
  DT_BR_H,
  DT_BR_W,
  DT_VB_W,
  dtMainX0,
  dtMainY,
} from './designThinkingLayout'

const LEFT_X = 22
const RIGHT_X = DT_VB_W - LEFT_X - DT_BR_W

function mainFill(i: number) {
  if (i === 0) return '#1f2937'
  return i % 2 === 1 ? '#d53f8c' : '#0ea5e9'
}

function branchFill(side: 'left' | 'right') {
  return side === 'left' ? '#c026d3' : '#0f766e'
}

function mainBlockClass(i: number) {
  return i === 0 ? 'main-block !cursor-pointer' : 'child-block !cursor-pointer'
}

export const DesignThinkingRoadmap = ({
  onNodeClick,
  completedNodes = [],
}: RoadmapDetailsProps) => {
  const done = useCallback((id: string) => completedNodes.includes(id), [
    completedNodes,
  ])

  const vbH = dtMainY(DT_MAIN.length - 1) + DT_MAIN_H + 48
  const x0 = dtMainX0()
  const mainRight = x0 + DT_MAIN_W

  const renderNode = (
    id: string,
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    fill: string,
    className: string,
    fs: number,
    isMain: boolean,
  ) => {
    const complete = done(id)
    const bx = x + w - 10
    const by = y + 9
    const cy = y + h / 2
    return (
      <g
        key={id}
        role="button"
        tabIndex={0}
        className={className}
        style={{ outline: 'none' }}
        data-node-id={id}
        data-type={isMain ? 'topic' : 'subtopic'}
        onClick={() => onNodeClick(id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onNodeClick(id)
          }
        }}
      >
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx="5"
          fill={fill}
          stroke="#ffffff"
          strokeWidth="2.7"
        />
        <text
          x={x + w / 2}
          y={cy + fs / 3}
          textAnchor="middle"
          fontSize={fs}
          fill="#FFFFFF"
        >
          <tspan>{label}</tspan>
        </text>
        <circle
          cx={bx}
          cy={by}
          r="9.5"
          fill="#16a34a"
          display={complete ? 'block' : 'none'}
        />
        <path
          d={`M ${bx - 4} ${by} L ${bx - 1.5} ${by + 3} L ${bx + 3.5} ${
            by - 2
          }`}
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          display={complete ? 'block' : 'none'}
        />
      </g>
    )
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${DT_VB_W} ${vbH}`}
      version="1.1"
      className="h-auto w-full max-w-full"
      style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
      role="img"
      aria-label="Design Thinking roadmap with branches"
    >
      {DT_MAIN.slice(0, -1).map((_, i) => {
        const y1 = dtMainY(i) + DT_MAIN_H
        const y2 = dtMainY(i + 1)
        const dash = i % 2 === 0 ? '0' : '0.8 8'
        return (
          <path
            key={`spine-${DT_MAIN[i].id}`}
            d={`M ${DT_CX} ${y1} C ${DT_CX} ${y1 + (y2 - y1) / 3} ${DT_CX} ${
              y2 - (y2 - y1) / 3
            } ${DT_CX} ${y2}`}
            fill="none"
            stroke="#cea500"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={dash}
          />
        )
      })}
      {DT_BRANCHES.map((b, bi) => {
        const yM = dtMainY(b.mainIndex)
        const cy = yM + DT_MAIN_H / 2
        const dash = bi % 2 === 0 ? '0.8 8' : '0'
        if (b.side === 'left') {
          const x1 = LEFT_X + DT_BR_W
          const x2 = x0
          return (
            <path
              key={`br-${b.id}`}
              d={`M ${x1} ${cy} L ${x2} ${cy}`}
              fill="none"
              stroke="#cea500"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={dash}
            />
          )
        }
        const x1 = mainRight
        const x2 = RIGHT_X
        return (
          <path
            key={`br-${b.id}`}
            d={`M ${x1} ${cy} L ${x2} ${cy}`}
            fill="none"
            stroke="#cea500"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={dash}
          />
        )
      })}
      {DT_MAIN.map((step, i) =>
        renderNode(
          step.id,
          x0,
          dtMainY(i),
          DT_MAIN_W,
          DT_MAIN_H,
          step.label,
          mainFill(i),
          mainBlockClass(i),
          10,
          true,
        ),
      )}
      {DT_BRANCHES.map((b) => {
        const yM = dtMainY(b.mainIndex)
        const y = yM + (DT_MAIN_H - DT_BR_H) / 2
        const x = b.side === 'left' ? LEFT_X : RIGHT_X
        return renderNode(
          b.id,
          x,
          y,
          DT_BR_W,
          DT_BR_H,
          b.label,
          branchFill(b.side),
          'child-block !cursor-pointer',
          10,
          false,
        )
      })}
    </svg>
  )
}
