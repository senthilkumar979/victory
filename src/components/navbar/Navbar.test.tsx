import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Navbar } from './Navbar'

const pathState = vi.hoisted(() => ({ pathname: '/students' }))

vi.mock('next/navigation', () => ({
  usePathname: () => pathState.pathname,
}))

vi.mock('next/image', () => ({
  default: function Image({ alt }: { alt: string }) {
    return <span data-alt={alt} />
  },
}))

vi.mock('next/link', () => ({
  default: function Link({
    href,
    children,
    ...rest
  }: {
    href: string
    children?: ReactNode
  } & Record<string, unknown>) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    )
  },
}))

vi.mock('goey-toast', () => ({
  GooeyToaster: function GooeyToaster() {
    return null
  },
}))

vi.mock('goey-toast/styles.css', () => ({}))

vi.mock('./UserMenu', () => ({
  UserMenu: function UserMenu() {
    return null
  },
}))

vi.mock('./NavbarMobilePanel', () => ({
  NavbarMobilePanel: function NavbarMobilePanel({ onClose }: { onClose: () => void }) {
    return (
      <div id="mobile-navigation-panel">
        <button type="button" onClick={onClose}>
          Dismiss panel
        </button>
      </div>
    )
  },
}))

vi.mock('framer-motion', () => {
  function createMotion(tag: string) {
    function MotionTag({
      children,
      ...props
    }: { children?: ReactNode } & Record<string, unknown>) {
      const rest = { ...props }
      for (const key of [
        'initial',
        'animate',
        'exit',
        'transition',
        'variants',
        'whileTap',
        'whileHover',
        'layoutId',
      ]) {
        delete rest[key]
      }
      return <div {...rest}>{children}</div>
    }
    MotionTag.displayName = `motion.${tag}`
    return MotionTag
  }

  const button = function MotionButton({
    children,
    ...props
  }: { children?: ReactNode } & Record<string, unknown>) {
    const rest = { ...props }
    delete rest.whileTap
    return <button {...rest}>{children}</button>
  }

  return {
    AnimatePresence: function AnimatePresence({ children }: { children?: ReactNode }) {
      return children
    },
    LayoutGroup: function LayoutGroup({ children }: { children?: ReactNode }) {
      return children
    },
    useReducedMotion: () => true,
    motion: {
      header: createMotion('header'),
      nav: createMotion('nav'),
      div: createMotion('div'),
      span: createMotion('span'),
      button,
    },
  }
})

const frames = new Map<number, FrameRequestCallback>()
let nextFrameId = 1

function flushFrames() {
  act(() => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const pending = [...frames.values()]
      if (pending.length === 0) return
      frames.clear()
      pending.forEach((callback) => callback(0))
    }
  })
}

beforeEach(() => {
  pathState.pathname = '/students'
  frames.clear()
  nextFrameId = 1
  document.body.style.overflow = ''
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    const id = nextFrameId
    nextFrameId += 1
    frames.set(id, callback)
    return id
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    frames.delete(id)
  })
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Navbar', () => {
  it('locks body scroll while the mobile menu is open and restores it on Escape', () => {
    render(<Navbar />)
    flushFrames()

    expect(screen.queryByRole('button', { name: 'Dismiss panel' })).not.toBeInTheDocument()
    expect(document.body.style.overflow).toBe('')

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))

    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(document.body.style.overflow).toBe('hidden')

    fireEvent.keyDown(window, { key: 'Enter' })
    expect(screen.getByRole('button', { name: 'Dismiss panel' })).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(screen.queryByRole('button', { name: 'Dismiss panel' })).not.toBeInTheDocument()
    expect(document.body.style.overflow).toBe('')
  })

  it('closes the mobile menu after the route changes', () => {
    const { rerender } = render(<Navbar />)
    flushFrames()

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(document.body.style.overflow).toBe('hidden')

    pathState.pathname = '/blogs'
    rerender(<Navbar />)
    flushFrames()

    expect(screen.queryByRole('button', { name: 'Dismiss panel' })).not.toBeInTheDocument()
    expect(document.body.style.overflow).toBe('')
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })
})
