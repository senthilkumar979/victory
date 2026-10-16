import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode, Ref } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DesktopBridgeConnector } from './DesktopBridgeConnector'

const bridgeState = vi.hoisted(() => ({
  reduced: false,
  boxShadows: [] as string[],
}))

vi.mock('motion/react', async () => {
  const React = await import('react')

  function createMotion(tag: string) {
    return React.forwardRef(function MotionTag(
      props: {
        children?: ReactNode
        className?: string
        animate?: { boxShadow?: string }
      },
      ref: Ref<HTMLElement>,
    ) {
      if (typeof props.animate?.boxShadow === 'string') {
        bridgeState.boxShadows.push(props.animate.boxShadow)
      }
      return React.createElement(
        tag,
        { ref, className: props.className },
        props.children,
      )
    })
  }

  return {
    useReducedMotion: () => bridgeState.reduced,
    motion: {
      div: createMotion('div'),
      span: createMotion('span'),
    },
  }
})

beforeEach(() => {
  bridgeState.reduced = false
  bridgeState.boxShadows = []
})

afterEach(() => {
  cleanup()
})

describe('DesktopBridgeConnector', () => {
  it('renders nothing until the bridge phase is visible', () => {
    const { container } = render(
      <DesktopBridgeConnector phase={1} showBridge={false} />,
    )

    expect(container).toBeEmptyDOMElement()
    expect(bridgeState.boxShadows).toEqual([])
  })

  it('uses the stronger glow only while the bridge phase is active', () => {
    const { rerender } = render(
      <DesktopBridgeConnector phase={1} showBridge />,
    )

    expect(screen.getByText('MentorBridge')).toBeInTheDocument()
    expect(screen.getByText('Training & mentorship')).toBeInTheDocument()
    expect(document.querySelector('.bg-cyan-100')).toBeInTheDocument()
    expect(bridgeState.boxShadows.at(-1)).toBe('0 0 14px rgba(6,182,212,0.38)')

    bridgeState.boxShadows = []
    rerender(<DesktopBridgeConnector phase={2} showBridge />)
    expect(bridgeState.boxShadows.at(-1)).toBe('0 0 26px rgba(6,182,212,0.55)')
  })

  it('omits the traveling dot when reduced motion is preferred', () => {
    bridgeState.reduced = true
    render(<DesktopBridgeConnector phase={2} showBridge />)

    expect(screen.getByText('MentorBridge')).toBeInTheDocument()
    expect(document.querySelector('.bg-cyan-100')).not.toBeInTheDocument()
  })
})
