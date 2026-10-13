import { cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LogSnagPageView } from './LogSnagPageView'

describe('LogSnagPageView', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true }),
    )
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('posts one page view with the default event and icon', async () => {
    const { rerender } = render(<LogSnagPageView channel="gallery" />)

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
    expect(fetch).toHaveBeenCalledWith('/api/logsnag/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: 'gallery',
        event: 'Page view',
        description: undefined,
        icon: '📄',
      }),
    })

    rerender(<LogSnagPageView channel="gallery" description="changed" />)

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('sends a custom event payload once per mount', async () => {
    render(
      <LogSnagPageView
        channel="awards"
        event="Award viewed"
        description="Hall of fame"
        icon="🏆"
      />,
    )

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
    expect(fetch).toHaveBeenCalledWith('/api/logsnag/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: 'awards',
        event: 'Award viewed',
        description: 'Hall of fame',
        icon: '🏆',
      }),
    })
  })
})
