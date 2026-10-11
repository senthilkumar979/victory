import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { NodeProps } from 'reactflow'

import type { RoadmapNodeDataWithCompletion } from './RoadmapNode'
import { RoadmapNode } from './RoadmapNode'

vi.mock('reactflow', () => {
  function Handle() {
    return null
  }

  return {
    Handle,
    Position: { Top: 'top', Bottom: 'bottom' },
  }
})

function renderNode(
  overrides: Partial<RoadmapNodeDataWithCompletion> = {},
  selected = false,
) {
  const data: RoadmapNodeDataWithCompletion = {
    id: 'node-1',
    title: 'Hooks',
    description: 'React hooks',
    resources: [],
    ...overrides,
  }

  return render(
    <RoadmapNode
      {...({
        id: data.id,
        data,
        selected,
        type: 'roadmap',
        zIndex: 0,
        isConnectable: true,
        xPos: 0,
        yPos: 0,
        dragging: false,
      } as NodeProps<RoadmapNodeDataWithCompletion>)}
    />,
  )
}

afterEach(() => {
  cleanup()
})

describe('RoadmapNode', () => {
  it('renders an incomplete node without the completion check', () => {
    const { container } = renderNode()
    const title = screen.getByText('Hooks')

    expect(title).toHaveClass('text-foreground')
    expect(title.querySelector('svg')).toBeNull()
    expect(container.querySelector('.bg-success')).toBeNull()
    expect(container.querySelector('.ring-2')).toBeNull()
  })

  it('treats a missing completion flag as incomplete', () => {
    renderNode({ isCompleted: undefined })

    expect(screen.getByText('Hooks')).toHaveClass('text-foreground')
    expect(screen.getByText('Hooks').querySelector('svg')).toBeNull()
  })

  it('marks a completed node and adds a selection ring when it is selected', () => {
    const { container } = renderNode({ isCompleted: true }, true)
    const title = screen.getByText('Hooks')

    expect(title).toHaveClass('text-white')
    expect(title.querySelector('svg')).toBeTruthy()
    expect(container.querySelector('.bg-success')).toBeTruthy()
    expect(container.querySelector('.ring-2')).toBeTruthy()
  })
})
