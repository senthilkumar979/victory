import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { designThinkingRoadmap } from '@/data/roadmaps/design-thinking'
import { storytellingRoadmap } from '@/data/roadmaps/storytelling'

import { DesignThinkingRoadmap } from './DesignThinkingRoadmap'
import { DT_BRANCHES, DT_MAIN } from './designThinkingLayout'
import { StorytellingRoadmap } from './StorytellingRoadmap'

afterEach(() => {
  cleanup()
})

function renderedNodeIds(): string[] {
  return screen.getAllByRole('button').map((node) => {
    const id = node.getAttribute('data-node-id')
    if (!id) throw new Error('roadmap button is missing data-node-id')
    return id
  })
}

function nodeById(id: string): HTMLElement {
  const node = screen.getByRole('button', {
    name: (_name, element) => element.getAttribute('data-node-id') === id,
  })
  return node
}

function completionDisplay(id: string): string | null {
  return nodeById(id).querySelector('circle')?.getAttribute('display') ?? null
}

describe('DesignThinkingRoadmap', () => {
  it('renders each content node once so a click can open that lesson', () => {
    render(
      <DesignThinkingRoadmap completedNodes={[]} onNodeClick={() => undefined} />,
    )

    const rendered = renderedNodeIds()
    const contentIds = designThinkingRoadmap.nodes.map((node) => node.id)

    expect(rendered).toHaveLength(new Set(rendered).size)
    expect([...rendered].sort()).toEqual([...contentIds].sort())
    expect(DT_MAIN.map((step) => step.id).every((id) => rendered.includes(id))).toBe(
      true,
    )
    expect(
      DT_BRANCHES.map((branch) => branch.id).every((id) => rendered.includes(id)),
    ).toBe(true)
  })

  it('activates a branch with click, Enter, and Space, and ignores other keys', async () => {
    const onNodeClick = vi.fn()
    const user = userEvent.setup()
    render(
      <DesignThinkingRoadmap completedNodes={[]} onNodeClick={onNodeClick} />,
    )

    const research = nodeById('dt-user-research')
    await user.click(research)
    research.focus()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')
    await user.keyboard('{Escape}')

    expect(onNodeClick.mock.calls.map((call) => call[0])).toEqual([
      'dt-user-research',
      'dt-user-research',
      'dt-user-research',
    ])
    expect(research).toHaveAttribute('data-type', 'subtopic')
    expect(nodeById('dt-empathize')).toHaveAttribute('data-type', 'topic')
  })

  it('places left branches left of the spine and shows a check only when complete', () => {
    render(
      <DesignThinkingRoadmap
        completedNodes={['dt-define']}
        onNodeClick={() => undefined}
      />,
    )

    const leftX = Number(nodeById('dt-user-research').querySelector('rect')?.getAttribute('x'))
    const rightX = Number(nodeById('dt-empathy-map').querySelector('rect')?.getAttribute('x'))
    const spineX = Number(nodeById('dt-empathize').querySelector('rect')?.getAttribute('x'))

    expect(leftX).toBeLessThan(spineX)
    expect(rightX).toBeGreaterThan(spineX)
    expect(completionDisplay('dt-define')).toBe('block')
    expect(completionDisplay('dt-intro')).toBe('none')
    expect(nodeById('dt-define').querySelector('path')?.getAttribute('display')).toBe(
      'block',
    )
  })
})

describe('StorytellingRoadmap', () => {
  it('keeps every storytelling lesson clickable and marks only completed steps', async () => {
    const onNodeClick = vi.fn()
    const user = userEvent.setup()
    render(
      <StorytellingRoadmap
        completedNodes={['st-hooks']}
        onNodeClick={onNodeClick}
      />,
    )

    const rendered = renderedNodeIds()
    expect([...rendered].sort()).toEqual(
      storytellingRoadmap.nodes.map((node) => node.id).sort(),
    )

    const hooks = nodeById('st-hooks')
    await user.click(hooks)
    hooks.focus()
    await user.keyboard(' ')
    await user.keyboard('x')

    expect(onNodeClick.mock.calls.map((call) => call[0])).toEqual([
      'st-hooks',
      'st-hooks',
    ])
    expect(completionDisplay('st-hooks')).toBe('block')
    expect(completionDisplay('st-why-stories')).toBe('none')
  })
})
