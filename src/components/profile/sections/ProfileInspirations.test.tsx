import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ProfileInspirations } from './ProfileInspirations'

vi.mock('framer-motion', () => ({
  motion: {
    li: function MotionLi({
      children,
      ...props
    }: { children?: ReactNode } & Record<string, unknown>) {
      const rest = { ...props }
      for (const key of ['initial', 'whileInView', 'viewport', 'transition']) {
        delete rest[key]
      }
      return <li {...rest}>{children}</li>
    },
  },
}))

vi.mock('@/components/ui/motioncards', () => ({
  default: function MotionCards({ children }: { children?: ReactNode }) {
    return <div data-testid="inspiration-cards">{children}</div>
  },
  MotionCardContent: function MotionCardContent({ children }: { children?: ReactNode }) {
    return <div>{children}</div>
  },
}))

afterEach(() => {
  cleanup()
})

describe('ProfileInspirations', () => {
  it('lists fewer than five names and builds a Wikipedia href from the raw name', () => {
    const { rerender } = render(<ProfileInspirations inspirations={[]} />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByTestId('inspiration-cards')).not.toBeInTheDocument()

    rerender(
      <ProfileInspirations
        inspirations={['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Edsger Dijkstra']}
      />,
    )

    expect(screen.queryByTestId('inspiration-cards')).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(screen.getByRole('link', { name: /Ada Lovelace/ })).toHaveAttribute(
      'href',
      'https://en.wikipedia.org/wiki/Ada Lovelace',
    )
    expect(screen.getByRole('link', { name: /Ada Lovelace/ })).toHaveAttribute(
      'target',
      '_blank',
    )
  })

  it('switches to the rotating card stack at five inspirations', () => {
    render(
      <ProfileInspirations
        inspirations={['One', 'Two', 'Three', 'Four', 'Five']}
      />,
    )

    expect(screen.getByTestId('inspiration-cards')).toBeInTheDocument()
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Five/ })).toHaveAttribute(
      'href',
      'https://en.wikipedia.org/wiki/Five',
    )
  })
})
