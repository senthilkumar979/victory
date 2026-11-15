import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useSelfIntroLimit } from './useSelfIntroLimit'

const STORAGE_KEY = 'self-intro-generation-count'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('useSelfIntroLimit over the daily cap', () => {
  it('reports zero remaining generations when the stored count is already above the cap', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ date: new Date().toDateString(), count: 5 }),
    )

    const { result } = renderHook(() => useSelfIntroLimit())

    await waitFor(() => expect(result.current.remaining).toBe(0))
    expect(result.current.canGenerate).toBe(false)
  })
})
