import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useInterviewPrepKeyboard } from './useInterviewPrepKeyboard'

afterEach(() => {
  cleanup()
})

function dispatchKey(
  key: string,
  target: EventTarget = window,
): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true })
  Object.defineProperty(event, 'target', { value: target })
  window.dispatchEvent(event)
  return event
}

describe('useInterviewPrepKeyboard', () => {
  it('navigates and toggles answers from the keyboard', () => {
    const goNext = vi.fn()
    const goPrev = vi.fn()
    const toggleAnswer = vi.fn()
    renderHook(() => useInterviewPrepKeyboard(goNext, goPrev, toggleAnswer))

    dispatchKey('ArrowRight')
    dispatchKey('ArrowLeft')
    dispatchKey(' ')
    dispatchKey('Enter')

    expect(goNext).toHaveBeenCalledTimes(1)
    expect(goPrev).toHaveBeenCalledTimes(1)
    expect(toggleAnswer).toHaveBeenCalledTimes(2)
  })

  it('ignores keys while typing in an input or textarea', () => {
    const goNext = vi.fn()
    const goPrev = vi.fn()
    const toggleAnswer = vi.fn()
    renderHook(() => useInterviewPrepKeyboard(goNext, goPrev, toggleAnswer))

    dispatchKey('ArrowRight', document.createElement('input'))
    dispatchKey('Enter', document.createElement('textarea'))

    expect(goNext).not.toHaveBeenCalled()
    expect(goPrev).not.toHaveBeenCalled()
    expect(toggleAnswer).not.toHaveBeenCalled()
  })

  it('removes the listener on unmount', () => {
    const goNext = vi.fn()
    const { unmount } = renderHook(() =>
      useInterviewPrepKeyboard(goNext, vi.fn(), vi.fn()),
    )

    unmount()
    dispatchKey('ArrowRight')
    expect(goNext).not.toHaveBeenCalled()
  })
})
