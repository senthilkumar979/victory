import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Node } from 'reactflow'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { RoadmapCanvas } from './RoadmapCanvas'

vi.mock('reactflow/dist/style.css', () => ({}))

vi.mock('reactflow', () => ({
  ReactFlow: ({
    nodes,
    onNodeClick,
  }: {
    nodes: Array<Node<{ isCompleted?: boolean }>>
    onNodeClick?: (
      event: unknown,
      node: Node<{ isCompleted?: boolean }>,
    ) => void
  }) => (
    <div>
      {nodes.map((node) => (
        <button
          key={node.id}
          type="button"
          onClick={(event) => onNodeClick?.(event, node)}
        >
          {node.id}:{node.data.isCompleted ? 'done' : 'open'}
        </button>
      ))}
    </div>
  ),
}))

const nodes: Node[] = [
  { id: 'react', position: { x: 0, y: 0 }, data: { label: 'React' } },
  { id: 'react-hooks', position: { x: 0, y: 40 }, data: { label: 'Hooks' } },
]

afterEach(() => {
  cleanup()
})

describe('RoadmapCanvas', () => {
  it('marks only exact completed ids and reports that flag on click', async () => {
    const user = userEvent.setup()
    const onNodeClick = vi.fn()

    render(
      <RoadmapCanvas
        nodes={nodes}
        edges={[]}
        completedNodes={['react']}
        onNodeClick={onNodeClick}
      />,
    )

    expect(screen.getByRole('button', { name: 'react:done' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'react-hooks:open' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'react:done' }))
    await user.click(screen.getByRole('button', { name: 'react-hooks:open' }))

    expect(onNodeClick).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ id: 'react', data: expect.objectContaining({ isCompleted: true }) }),
      true,
    )
    expect(onNodeClick).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        id: 'react-hooks',
        data: expect.objectContaining({ isCompleted: false }),
      }),
      false,
    )
  })

  it('treats a missing completion list as all open and ignores clicks without a handler', async () => {
    const user = userEvent.setup()

    render(<RoadmapCanvas nodes={nodes} edges={[]} />)

    expect(screen.getByRole('button', { name: 'react:open' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'react:open' }))
  })
})
