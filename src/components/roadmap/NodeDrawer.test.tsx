import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { RoadmapNodeMeta } from '@/data/roadmaps'

import { NodeDrawer } from './NodeDrawer'

const clerkState = {
  user: null as { publicMetadata?: { isAdmin?: unknown } } | null,
}

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: clerkState.user }),
}))

vi.mock('framer-motion', () => ({
  AnimatePresence: function AnimatePresenceMock({
    children,
  }: {
    children: ReactNode
  }) {
    return <>{children}</>
  },
  motion: {
    div: function MotionDiv({
      children,
      onClick,
      className,
    }: {
      children?: ReactNode
      onClick?: () => void
      className?: string
    }) {
      return (
        <div className={className} onClick={onClick}>
          {children}
        </div>
      )
    },
    aside: function MotionAside({
      children,
      role,
      'aria-labelledby': labelledBy,
      'aria-modal': modal,
    }: {
      children?: ReactNode
      role?: string
      'aria-labelledby'?: string
      'aria-modal'?: boolean | 'true' | 'false'
    }) {
      return (
        <aside role={role} aria-labelledby={labelledBy} aria-modal={modal}>
          {children}
        </aside>
      )
    },
  },
}))

const node: RoadmapNodeMeta = {
  id: 'node-1',
  title: 'Closures',
  description: 'Functions that remember their scope.',
  resources: [],
}

beforeEach(() => {
  clerkState.user = null
})

afterEach(() => {
  cleanup()
})

describe('NodeDrawer', () => {
  it('renders nothing when no node is selected', () => {
    render(
      <NodeDrawer
        node={null}
        isCompleted={false}
        onClose={vi.fn()}
        onComplete={vi.fn()}
        onIncomplete={vi.fn()}
      />,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mark Complete' })).not.toBeInTheDocument()
  })

  it('hides completion controls from members and the string false admin flag', () => {
    const { rerender } = render(
      <NodeDrawer
        node={node}
        isCompleted={false}
        onClose={vi.fn()}
        onComplete={vi.fn()}
        onIncomplete={vi.fn()}
      />,
    )

    expect(screen.getByRole('dialog', { name: 'Closures' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mark Complete' })).not.toBeInTheDocument()

    clerkState.user = { publicMetadata: { isAdmin: false } }
    rerender(
      <NodeDrawer
        node={node}
        isCompleted={false}
        onClose={vi.fn()}
        onComplete={vi.fn()}
        onIncomplete={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Mark Complete' })).not.toBeInTheDocument()

    clerkState.user = { publicMetadata: { isAdmin: 'false' } }
    rerender(
      <NodeDrawer
        node={node}
        isCompleted={false}
        onClose={vi.fn()}
        onComplete={vi.fn()}
        onIncomplete={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Mark Complete' })).not.toBeInTheDocument()

    clerkState.user = { publicMetadata: { role: ' Admin ' } }
    rerender(
      <NodeDrawer
        node={node}
        isCompleted={false}
        onClose={vi.fn()}
        onComplete={vi.fn()}
        onIncomplete={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Mark Complete' })).toBeInTheDocument()
  })

  it('lets an admin mark a node complete or incomplete and closes on Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onComplete = vi.fn()
    const onIncomplete = vi.fn()
    clerkState.user = { publicMetadata: { isAdmin: true } }

    const { rerender } = render(
      <NodeDrawer
        node={node}
        isCompleted={false}
        onClose={onClose}
        onComplete={onComplete}
        onIncomplete={onIncomplete}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Mark Complete' }))
    expect(onComplete).toHaveBeenCalledWith('node-1')
    expect(screen.queryByRole('button', { name: 'Mark Incomplete' })).not.toBeInTheDocument()

    rerender(
      <NodeDrawer
        node={node}
        isCompleted
        onClose={onClose}
        onComplete={onComplete}
        onIncomplete={onIncomplete}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Mark Incomplete' }))
    expect(onIncomplete).toHaveBeenCalledWith('node-1')

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })
})
