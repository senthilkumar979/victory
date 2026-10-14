import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createElement, forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Drawer } from './Drawer'

vi.mock('framer-motion', () => {
  interface MotionProps extends HTMLAttributes<HTMLElement> {
    children?: ReactNode
  }

  function createMotionComponent(tag: string) {
    const MotionComponent = forwardRef<HTMLElement, MotionProps>(
      function MotionComponent({ children, ...props }, ref) {
        return createElement(tag, { ...props, ref }, children)
      },
    )
    MotionComponent.displayName = `motion.${tag}`
    return MotionComponent
  }

  return {
    AnimatePresence: ({ children }: { children?: ReactNode }) => children,
    motion: new Proxy(
      {},
      { get: (_target, tag: string) => createMotionComponent(tag) },
    ),
  }
})

afterEach(() => {
  cleanup()
})

describe('Drawer', () => {
  it('does not render a dialog while closed', () => {
    render(
      <Drawer isOpen={false} onClose={vi.fn()}>
        Hidden
      </Drawer>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes from Escape, the backdrop, and the close button, not the panel', () => {
    const onClose = vi.fn()
    const { rerender } = render(
      <Drawer isOpen onClose={onClose} side="left" size="xxxl">
        <Drawer.Title description="Optional context">Edit award</Drawer.Title>
        <button type="button">Inside</button>
      </Drawer>,
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('max-w-3xl')
    expect(dialog.parentElement?.className).toContain('justify-start')
    expect(screen.getByRole('heading', { name: 'Edit award' })).toBeInTheDocument()
    expect(screen.getByText('Optional context')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Tab' })
    fireEvent.click(screen.getByRole('button', { name: 'Inside' }))
    fireEvent.click(dialog)
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.keyDown(window, { key: 'Escape' })
    fireEvent.click(screen.getByRole('button', { name: 'Close drawer' }))
    const backdrop = dialog.parentElement?.previousElementSibling
    fireEvent.click(backdrop as HTMLElement)
    expect(onClose).toHaveBeenCalledTimes(3)

    rerender(
      <Drawer isOpen={false} onClose={onClose}>
        Hidden
      </Drawer>,
    )
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('defaults to the right side and omits an empty description', () => {
    render(
      <Drawer isOpen onClose={vi.fn()} showCloseButton={false}>
        <Drawer.Title description="">Meeting</Drawer.Title>
      </Drawer>,
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('max-w-sm')
    expect(dialog.parentElement?.className).toContain('justify-end')
    expect(screen.getByRole('heading', { name: 'Meeting' })).toBeInTheDocument()
    expect(dialog.querySelector('p')).toBeNull()
    expect(
      screen.queryByRole('button', { name: 'Close drawer' }),
    ).not.toBeInTheDocument()
  })
})
