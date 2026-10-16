import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RadialOrbitalTimeline } from './radial-orbital-timeline'

function NodeIcon() {
  return <svg />
}

const items = [
  {
    id: 1,
    title: 'Discover',
    date: 'Jan',
    content: 'Find the problem',
    category: 'agile',
    icon: NodeIcon,
    relatedIds: [2],
    status: 'completed' as const,
    energy: 80,
  },
  {
    id: 2,
    title: 'Build',
    date: 'Feb',
    content: 'Ship the slice',
    category: 'agile',
    icon: NodeIcon,
    relatedIds: [] as number[],
    status: 'in-progress' as const,
    energy: 40,
  },
  {
    id: 3,
    title: 'Learn',
    date: 'Mar',
    content: 'Reflect',
    category: 'agile',
    icon: NodeIcon,
    relatedIds: [] as number[],
    status: 'archived' as unknown as 'pending',
    energy: 10,
  },
]

const circleFor = (title: string) => {
  const label = screen
    .getAllByText(title)
    .find((element) => element.className.includes('top-12'))
  return label?.previousElementSibling ?? null
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('RadialOrbitalTimeline', () => {
  it('uses a bounded height only when embedded', () => {
    const { container, rerender } = render(
      <RadialOrbitalTimeline timelineData={items} />,
    )
    expect(container.firstElementChild).toHaveClass('h-screen')

    rerender(<RadialOrbitalTimeline timelineData={items} embedded />)
    expect(container.firstElementChild?.className).toContain('h-[min(72vh,720px)]')
  })

  it('expands one node, pulses its connections, and labels unknown status as pending', () => {
    const { container } = render(<RadialOrbitalTimeline timelineData={items} />)

    fireEvent.click(screen.getByText('Discover'))

    expect(screen.getByText('COMPLETE')).toHaveClass('bg-black')
    expect(screen.getByText('Find the problem')).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Build/ })).toBeInTheDocument()
    expect(circleFor('Build')).toHaveClass('animate-pulse')
    expect(circleFor('Learn')).not.toHaveClass('animate-pulse')

    fireEvent.click(screen.getByRole('button', { name: /Build/ }))

    expect(screen.queryByText('COMPLETE')).not.toBeInTheDocument()
    expect(screen.getByText('IN PROGRESS')).toHaveClass('bg-white')
    expect(screen.queryByText('Connected Nodes')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Learn'))
    expect(screen.getByText('PENDING')).toHaveClass('bg-black/40')
    expect(screen.queryByText('IN PROGRESS')).not.toBeInTheDocument()

    fireEvent.click(container.firstElementChild as Element)
    expect(screen.queryByText('PENDING')).not.toBeInTheDocument()
  })
})
