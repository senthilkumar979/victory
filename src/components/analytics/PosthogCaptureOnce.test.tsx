import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PosthogCaptureOnce } from './PosthogCaptureOnce'

const { capture } = vi.hoisted(() => ({
  capture: vi.fn(),
}))

vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({ capture }),
}))

afterEach(() => {
  cleanup()
  capture.mockClear()
})

describe('PosthogCaptureOnce', () => {
  it('captures once per mount even when properties change identity', () => {
    const { rerender } = render(
      <PosthogCaptureOnce event="award_viewed" properties={{ id: 'a1' }} />,
    )

    expect(capture).toHaveBeenCalledTimes(1)
    expect(capture).toHaveBeenCalledWith('award_viewed', { id: 'a1' })

    rerender(
      <PosthogCaptureOnce event="award_viewed" properties={{ id: 'a1' }} />,
    )
    rerender(
      <PosthogCaptureOnce event="other_event" properties={{ id: 'a2' }} />,
    )

    expect(capture).toHaveBeenCalledTimes(1)
  })

  it('captures again after the component remounts', () => {
    const first = render(
      <PosthogCaptureOnce event="page_section" properties={{ section: 'hero' }} />,
    )
    first.unmount()

    render(<PosthogCaptureOnce event="page_section" />)

    expect(capture).toHaveBeenNthCalledWith(1, 'page_section', {
      section: 'hero',
    })
    expect(capture).toHaveBeenNthCalledWith(2, 'page_section', undefined)
    expect(capture).toHaveBeenCalledTimes(2)
  })
})
