import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CARDS } from './data'
import {
  PHASE_BRIDGE_MS,
  PHASE_CYCLE_MS,
  PHASE_OUTCOME_MS,
  PHASE_STUDENT_MS,
} from './transformationMobileTiming'
import { useTransformationPhasedCycle } from './useTransformationPhasedCycle'

describe('useTransformationPhasedCycle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('holds each phase until its boundary, then advances one card', () => {
    const { result } = renderHook(() => useTransformationPhasedCycle())

    expect(result.current.phase).toBe(1)
    expect(result.current.cardIndex).toBe(0)
    expect(result.current.currentCard).toEqual(CARDS[0])

    act(() => {
      vi.advanceTimersByTime(PHASE_STUDENT_MS - 1)
    })
    expect(result.current.phase).toBe(1)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current.phase).toBe(2)
    expect(result.current.cardIndex).toBe(0)

    act(() => {
      vi.advanceTimersByTime(PHASE_BRIDGE_MS)
    })
    expect(result.current.phase).toBe(3)

    act(() => {
      vi.advanceTimersByTime(PHASE_OUTCOME_MS - 1)
    })
    expect(result.current.phase).toBe(3)
    expect(result.current.cardIndex).toBe(0)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current.phase).toBe(1)
    expect(result.current.cardIndex).toBe(1)
    expect(result.current.currentCard).toEqual(CARDS[1])
  })

  it('wraps to the first story after the last card and ignores timers after unmount', () => {
    const { result, unmount } = renderHook(() => useTransformationPhasedCycle())

    for (let step = 0; step < CARDS.length; step += 1) {
      act(() => {
        vi.advanceTimersByTime(PHASE_CYCLE_MS)
      })
    }

    expect(result.current.cardIndex).toBe(0)
    expect(result.current.phase).toBe(1)
    expect(result.current.currentCard).toEqual(CARDS[0])

    unmount()
    act(() => {
      vi.advanceTimersByTime(PHASE_CYCLE_MS * 3)
    })

    expect(result.current.cardIndex).toBe(0)
    expect(result.current.phase).toBe(1)
  })
})
