import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createElement, forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Modal } from './Modal'

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

describe('Modal', () => {
  it('stays unmounted until opened', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        Hidden
      </Modal>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
  })

  it('closes from Escape, the backdrop, and the close button only', () => {
    const onClose = vi.fn()
    const { rerender } = render(
      <Modal isOpen onClose={onClose} size="xl">
        <Modal.Title>Invite</Modal.Title>
        <Modal.Body>
          <button type="button">Keep open</button>
        </Modal.Body>
      </Modal>,
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('max-w-4xl')
    expect(screen.getByText('Invite')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Enter' })
    fireEvent.click(screen.getByRole('button', { name: 'Keep open' }))
    fireEvent.click(dialog)
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.keyDown(window, { key: 'Escape' })
    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }))
    fireEvent.click(dialog.parentElement as HTMLElement)
    expect(onClose).toHaveBeenCalledTimes(3)

    rerender(
      <Modal isOpen={false} onClose={onClose}>
        Hidden
      </Modal>,
    )
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(3)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('can hide the close button', () => {
    render(
      <Modal isOpen onClose={vi.fn()} showCloseButton={false} size="sm">
        Body
      </Modal>,
    )

    expect(screen.getByRole('dialog').className).toContain('max-w-md')
    expect(
      screen.queryByRole('button', { name: 'Close modal' }),
    ).not.toBeInTheDocument()
  })
})
