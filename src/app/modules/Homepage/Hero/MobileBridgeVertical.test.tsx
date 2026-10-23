import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode, Ref } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MobileBridgeVertical } from './MobileBridgeVertical'

const bridgeState = vi.hoisted(() => ({
  reduced: false,
}))

vi.mock('./useJourneyReducedMotion', () => ({
  useJourneyReducedMotion: () => bridgeState.reduced,
}))

vi.mock('motion/react', async () => {
  const React = await import('react')

  function createMotion(tag: string) {
    const MotionTag = React.forwardRef(function MotionTag(
      props: {
        children?: ReactNode
        className?: string
        animate?: { boxShadow?: string }
      },
      ref: Ref<HTMLElement>,
    ) {
      const boxShadow = props.animate?.boxShadow
      return React.createElement(
        tag,
        {
          ref,
          className: props.className,
          'data-box-shadow': typeof boxShadow === 'string' ? boxShadow : undefined,
        },
        props.children,
      )
    })
    MotionTag.displayName = `Motion${tag}`
    return MotionTag
  }

  return {
    motion: {
      div: createMotion('div'),
      span: createMotion('span'),
    },
  }
})

function latestGlow(): string | null {
  const nodes = document.querySelectorAll('[data-box-shadow]')
  const last = nodes.item(nodes.length - 1)
  return last?.getAttribute('data-box-shadow') ?? null
}

describe('MobileBridgeVertical', () => {
  beforeEach(() => {
    bridgeState.reduced = false
  })

  afterEach(() => {
    cleanup()
  })

  it('renders nothing until the bridge phase is visible', () => {
    const { container } = render(
      <MobileBridgeVertical phase={1} showBridge={false} />,
    )

    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByText('Training & mentorship')).not.toBeInTheDocument()
  })

  it('uses the stronger glow only while phase 2 is active', () => {
    const { rerender } = render(<MobileBridgeVertical phase={2} showBridge />)

    expect(screen.getByText('MentorBridge')).toBeInTheDocument()
    expect(screen.getByText('Training & mentorship')).toBeInTheDocument()
    expect(document.querySelector('.bg-cyan-300')).toBeInTheDocument()
    expect(latestGlow()).toBe('0 0 28px rgba(6,182,212,0.55)')

    rerender(<MobileBridgeVertical phase={3} showBridge />)

    expect(latestGlow()).toBe('0 0 14px rgba(6,182,212,0.35)')
  })

  it('omits the traveling dot when reduced motion is preferred', () => {
    bridgeState.reduced = true
    render(<MobileBridgeVertical phase={2} showBridge />)

    expect(screen.getByText('MentorBridge')).toBeInTheDocument()
    expect(document.querySelector('.bg-cyan-300')).not.toBeInTheDocument()
    expect(latestGlow()).toBe('0 0 28px rgba(6,182,212,0.55)')
  })
})
