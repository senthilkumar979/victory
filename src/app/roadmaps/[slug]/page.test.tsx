import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import RoadmapSlugPage from './page'

const { paramsState, progressState, useRoadmapProgressMock } = vi.hoisted(() => ({
  paramsState: { slug: 'typescript' as string | string[] | undefined },
  progressState: {
    completedNodes: [] as string[],
    markComplete: vi.fn(),
    unmarkComplete: vi.fn(),
    isLoading: false,
    error: null as string | null,
  },
  useRoadmapProgressMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: paramsState.slug }),
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
  }: {
    href: string
    children: ReactNode
  }) => <a href={href}>{children}</a>,
}))

vi.mock('@/templates/PagaMain', () => ({
  PageMain: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}))

vi.mock('@/hooks/useRoadmapProgress', () => ({
  useRoadmapProgress: useRoadmapProgressMock,
}))

vi.mock('@/components/roadmap/NodeDrawer', () => ({
  NodeDrawer: ({
    node,
    isCompleted,
    onComplete,
    onIncomplete,
  }: {
    node: { id: string; title: string } | null
    isCompleted: boolean
    onComplete: (id: string) => void
    onIncomplete: (id: string) => void
  }) => {
    if (!node) return null
    return (
      <section aria-label="Node drawer">
        <p>{node.title}</p>
        <p>{isCompleted ? 'node-completed' : 'node-open'}</p>
        <button type="button" onClick={() => onComplete(node.id)}>
          Mark complete
        </button>
        <button type="button" onClick={() => onIncomplete(node.id)}>
          Mark incomplete
        </button>
      </section>
    )
  },
}))

vi.mock('@/modules/Roadmaps/TypeScriptRoadmap', () => ({
  TypeScriptRoadmap: ({
    onNodeClick,
    completedNodes,
  }: {
    onNodeClick: (id: string) => void
    completedNodes: string[]
  }) => (
    <div>
      <p>completed:{completedNodes.join(',')}</p>
      <button type="button" onClick={() => onNodeClick('tZFWeWHdOUJcCEtHfXH9p')}>
        Open known node
      </button>
      <button type="button" onClick={() => onNodeClick('missing-node')}>
        Open missing node
      </button>
      <button type="button" onClick={() => onNodeClick('')}>Open empty node</button>
    </div>
  ),
}))

vi.mock('@/modules/Roadmaps/JavaRoadmap', () => ({
  JavaRoadmap: () => <div>java-roadmap</div>,
}))

vi.mock('@/modules/Roadmaps/JavaScriptRoadmap', () => ({
  JavaScriptRoadmap: () => <div>javascript-roadmap</div>,
}))

vi.mock('@/modules/Roadmaps/ReactRoadmap', () => ({
  ReactRoadmap: () => <div>react-roadmap</div>,
}))

vi.mock('@/modules/Roadmaps/SpringBootRoadmap', () => ({
  SpringBootRoadmap: () => <div>spring-roadmap</div>,
}))

vi.mock('@/modules/Roadmaps/StorytellingRoadmap', () => ({
  StorytellingRoadmap: () => <div>storytelling-roadmap</div>,
}))

vi.mock('@/modules/Roadmaps/DesignThinkingRoadmap', () => ({
  DesignThinkingRoadmap: () => <div>design-thinking-roadmap</div>,
}))

describe('roadmap slug page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    paramsState.slug = 'typescript'
    progressState.completedNodes = []
    progressState.isLoading = false
    progressState.error = null
    useRoadmapProgressMock.mockImplementation(() => progressState)
  })

  afterEach(() => {
    cleanup()
  })

  it('shows a not-found state for an unknown or non-string slug', () => {
    paramsState.slug = 'cobol'

    render(<RoadmapSlugPage />)

    expect(screen.getByRole('heading', { name: 'Roadmap not found' })).toBeInTheDocument()
    expect(screen.getByText(/The roadmap "cobol" does not exist/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View TypeScript Roadmap/ })).toHaveAttribute(
      'href',
      '/roadmaps/typescript',
    )
    expect(useRoadmapProgressMock).toHaveBeenCalledWith('cobol')

    cleanup()
    paramsState.slug = ['typescript']
    render(<RoadmapSlugPage />)

    expect(screen.getByRole('heading', { name: 'Roadmap not found' })).toBeInTheDocument()
    expect(useRoadmapProgressMock).toHaveBeenCalledWith('')
  })

  it('links Java to the core-java interview track and omits tracks without prep', () => {
    paramsState.slug = 'java'
    render(<RoadmapSlugPage />)

    expect(screen.getByRole('heading', { name: 'Java' })).toBeInTheDocument()
    expect(screen.getByText('java-roadmap')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Interview prep for this track/ })).toHaveAttribute(
      'href',
      '/interview-prep/core-java',
    )

    cleanup()
    paramsState.slug = 'design-thinking'
    render(<RoadmapSlugPage />)

    expect(screen.getByRole('heading', { name: 'Design Thinking' })).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /Interview prep for this track/ }),
    ).not.toBeInTheDocument()
  })

  it('opens a known node, ignores unknown ids, and records completion', async () => {
    const user = userEvent.setup()
    progressState.completedNodes = ['tZFWeWHdOUJcCEtHfXH9p']
    progressState.isLoading = true
    progressState.error = 'Could not save progress'

    render(<RoadmapSlugPage />)

    expect(screen.getByText('Loading progress…')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Could not save progress')
    expect(screen.getByText('completed:tZFWeWHdOUJcCEtHfXH9p')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Interview prep for this track/ })).toHaveAttribute(
      'href',
      '/interview-prep/typescript',
    )

    await user.click(screen.getByRole('button', { name: 'Open missing node' }))
    await user.click(screen.getByRole('button', { name: 'Open empty node' }))
    expect(screen.queryByLabelText('Node drawer')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Open known node' }))
    expect(screen.getByLabelText('Node drawer')).toHaveTextContent('Abstract Classes')
    expect(screen.getByText('node-completed')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mark incomplete' }))
    expect(progressState.unmarkComplete).toHaveBeenCalledWith('tZFWeWHdOUJcCEtHfXH9p')
    expect(screen.queryByLabelText('Node drawer')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Open known node' }))
    await user.click(screen.getByRole('button', { name: 'Mark complete' }))
    expect(progressState.markComplete).toHaveBeenCalledWith('tZFWeWHdOUJcCEtHfXH9p')
    expect(screen.queryByLabelText('Node drawer')).not.toBeInTheDocument()
  })
})
