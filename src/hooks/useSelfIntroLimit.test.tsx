import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { useSelfIntroLimit } from './useSelfIntroLimit'

const STORAGE_KEY = 'self-intro-generation-count'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('useSelfIntroLimit', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with two remaining generations for an empty store', async () => {
    const { result } = renderHook(() => useSelfIntroLimit())

    await waitFor(() => expect(result.current.remaining).toBe(2))
    expect(result.current.canGenerate).toBe(true)
  })

  it('blocks further generations once the daily cap is reached', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ date: new Date().toDateString(), count: 2 }),
    )

    const { result } = renderHook(() => useSelfIntroLimit())

    await waitFor(() => expect(result.current.canGenerate).toBe(false))
    expect(result.current.remaining).toBe(0)
  })

  it('increments the stored count and remaining generations', async () => {
    const { result } = renderHook(() => useSelfIntroLimit())

    await waitFor(() => expect(result.current.remaining).toBe(2))

    act(() => {
      result.current.incrementCount()
    })

    expect(result.current.remaining).toBe(1)
    expect(result.current.canGenerate).toBe(true)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toEqual({
      date: new Date().toDateString(),
      count: 1,
    })
  })

  it('resets the count when the stored date is from a previous day', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ date: 'Wed Jan 01 2020', count: 2 }),
    )

    const { result } = renderHook(() => useSelfIntroLimit())

    await waitFor(() => expect(result.current.canGenerate).toBe(true))
    expect(result.current.remaining).toBe(2)

    act(() => {
      result.current.incrementCount()
    })

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toEqual({
      date: new Date().toDateString(),
      count: 1,
    })
  })

  it('treats corrupt or invalid storage as an empty count', async () => {
    localStorage.setItem(STORAGE_KEY, '{not-json')

    const { result } = renderHook(() => useSelfIntroLimit())

    await waitFor(() => expect(result.current.remaining).toBe(2))

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ date: 1, count: 'x' }),
    )

    const { result: invalidResult } = renderHook(() => useSelfIntroLimit())
    await waitFor(() => expect(invalidResult.current.remaining).toBe(2))
  })
})
