import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/dynamic', async () => {
  const { createElement } = await vi.importActual<typeof import('react')>(
    'react',
  )

  return {
    default: () =>
      function DynamicComponent() {
        return createElement('div', { 'data-testid': 'partners-carousel' })
      },
  }
})

vi.mock('next/link', async () => {
  const { createElement } = await vi.importActual<typeof import('react')>(
    'react',
  )

  interface LinkMockProps {
    children?: React.ReactNode
    href: string
    [key: string]: unknown
  }

  return {
    default: ({ children, href, ...props }: LinkMockProps) =>
      createElement('a', { ...props, href }, children),
  }
})

vi.mock('motion/react', async () => {
  const { createElement } = await vi.importActual<typeof import('react')>(
    'react',
  )

  interface MotionMockProps {
    children?: React.ReactNode
    initial?: unknown
    animate?: unknown
    transition?: unknown
    variants?: unknown
    [key: string]: unknown
  }

  function serialize(value: unknown): string | undefined {
    if (value === undefined) return undefined
    if (typeof value === 'boolean') return String(value)

    return JSON.stringify(value)
  }

  function createMotionComponent(tag: 'div' | 'p') {
    return ({
      children,
      initial,
      animate,
      transition,
      variants,
      ...props
    }: MotionMockProps) =>
      createElement(
        tag,
        {
          ...props,
          'data-animate': serialize(animate),
          'data-initial': serialize(initial),
          'data-motion': tag,
          'data-transition': serialize(transition),
          'data-variants': serialize(variants),
        },
        children,
      )
  }

  return {
    motion: {
      div: createMotionComponent('div'),
      p: createMotionComponent('p'),
    },
  }
})

vi.mock('@/templates/PagaMain', async () => {
  const { createElement } = await vi.importActual<typeof import('react')>(
    'react',
  )

  return {
    PageMain: ({ children }: { children: React.ReactNode }) =>
      createElement('main', null, children),
  }
})

vi.mock('./TransformationBridge', async () => {
  const { createElement } = await vi.importActual<typeof import('react')>(
    'react',
  )

  return {
    TransformationBridge: () =>
      createElement('div', { 'data-testid': 'desktop-bridge' }),
  }
})

vi.mock('./TransformationBridgeMobile', async () => {
  const { createElement } = await vi.importActual<typeof import('react')>(
    'react',
  )

  return {
    TransformationBridgeMobile: () =>
      createElement('div', { 'data-testid': 'mobile-bridge' }),
  }
})

import { Hero } from './Hero'

describe('Hero', () => {
  it('keeps the LCP heading immediately visible while animating secondary content', () => {
    render(<Hero />)

    const heading = screen.getByRole('heading', {
      name: /bridging the gap from\s+rural classrooms\s+to global tech/i,
    })
    const textColumn = heading.parentElement
    const description = screen.getByText(
      /empowering students from rural areas/i,
    )
    const bridgeColumn = screen
      .getByTestId('desktop-bridge')
      .closest('[data-motion="div"]')

    expect(heading).toBeVisible()
    expect(heading).not.toHaveAttribute('data-motion')
    expect(textColumn).not.toHaveAttribute('data-motion')
    expect(textColumn).not.toHaveAttribute('data-initial')
    expect(description).toHaveAttribute(
      'data-initial',
      JSON.stringify({ opacity: 0, y: 14 }),
    )
    expect(description).toHaveAttribute(
      'data-animate',
      JSON.stringify({ opacity: 1, y: 0 }),
    )
    expect(bridgeColumn).toHaveAttribute('data-initial', 'false')
    expect(screen.getByRole('link', { name: /hire talents/i })).toHaveAttribute(
      'href',
      '/students',
    )
  })
})
