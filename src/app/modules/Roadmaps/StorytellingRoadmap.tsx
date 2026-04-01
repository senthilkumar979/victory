import type { RoadmapDetailsProps } from '@/data/roadmaps/types'
import { useCallback } from 'react'

const STEPS = [
  { id: 'st-why-stories', label: 'Why stories work' },
  { id: 'st-audience', label: 'Know your audience' },
  { id: 'st-message', label: 'Clarify your message' },
  { id: 'st-structure', label: 'Structure & arc' },
  { id: 'st-character-conflict', label: 'Character & conflict' },
  { id: 'st-hooks', label: 'Hooks & openings' },
  { id: 'st-voice', label: 'Voice & language' },
  { id: 'st-visual', label: 'Visual & media' },
  { id: 'st-delivery', label: 'Delivery & presence' },
  { id: 'st-measure', label: 'Measure & iterate' },
] as const

const CX = 240
const W = 154.3
const H = 28.3
const GAP = 28
const TOP = 35
const X0 = CX - W / 2

const stepY = (i: number) => TOP + i * (H + GAP)

function fillForIndex(i: number) {
  if (i === 0) return '#1f2937'
  return i % 2 === 1 ? '#d53f8c' : '#0ea5e9'
}

function blockClass(i: number) {
  return i === 0 ? 'main-block !cursor-pointer' : 'child-block !cursor-pointer'
}

export const StorytellingRoadmap = ({
  onNodeClick,
  completedNodes = [],
}: RoadmapDetailsProps) => {
  const done = useCallback((id: string) => completedNodes.includes(id), [
    completedNodes,
  ])

  const vbH = stepY(STEPS.length - 1) + H + 35

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 480 ${vbH}`}
      version="1.1"
      className="h-auto w-full max-w-full"
      style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
      role="img"
      aria-label="Storytelling learning path"
    >
      {STEPS.slice(0, -1).map((_, i) => {
        const y1 = stepY(i) + H
        const y2 = stepY(i + 1)
        const dash = i % 2 === 0 ? '0' : '0.8 8'
        return (
          <path
            key={`edge-${STEPS[i].id}`}
            d={`M ${CX} ${y1} C ${CX} ${y1 + (y2 - y1) / 3} ${CX} ${
              y2 - (y2 - y1) / 3
            } ${CX} ${y2}`}
            fill="none"
            stroke="#cea500"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={dash}
          />
        )
      })}
      {STEPS.map((step, i) => {
        const y = stepY(i)
        const complete = done(step.id)
        const bx = X0 + W - 12
        const by = y + 10
        return (
          <g
            key={step.id}
            role="button"
            tabIndex={0}
            className={blockClass(i)}
            style={{ outline: 'none' }}
            data-node-id={step.id}
            data-type={i === 0 ? 'button' : 'subtopic'}
            onClick={() => onNodeClick(step.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onNodeClick(step.id)
              }
            }}
          >
            <rect
              x={X0}
              y={y}
              width={W}
              height={H}
              rx="5"
              fill={fillForIndex(i)}
              stroke="#ffffff"
              strokeWidth="2.7"
            />
            <text
              x={CX}
              y={y + H / 2 + 3}
              textAnchor="middle"
              fontSize="8"
              fill="#FFFFFF"
            >
              <tspan>{step.label}</tspan>
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
      })}
    </svg>
  )
}
