import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PosthogPageView } from './PosthogPageView'

const { capture, nav } = vi.hoisted(() => ({
  capture: vi.fn(),
  nav: {
    pathname: '/students' as string | null,
    search: '' as string | null,
  },
}))

vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({ capture }),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => nav.pathname,
  useSearchParams: () =>
    nav.search === null ? null : { toString: () => nav.search },
}))

describe('PosthogPageView', () => {
  beforeEach(() => {
    capture.mockReset()
    nav.pathname = '/students'
    nav.search = ''
  })

  afterEach(() => {
    cleanup()
  })

  it('does not capture a page view without a pathname', () => {
    nav.pathname = ''

    render(<PosthogPageView />)

    expect(capture).not.toHaveBeenCalled()
  })

  it('records the origin and path once, without a dangling query marker', () => {
    const { rerender } = render(<PosthogPageView />)

    expect(capture).toHaveBeenCalledTimes(1)
    expect(capture).toHaveBeenCalledWith('$pageview', {
      $current_url: `${window.location.origin}/students`,
    })

    rerender(<PosthogPageView />)

    expect(capture).toHaveBeenCalledTimes(1)
  })

  it('appends search params and captures again only when the url changes', () => {
    nav.pathname = '/blogs'
    nav.search = 'page=2'

    const { rerender } = render(<PosthogPageView />)

    expect(capture).toHaveBeenCalledWith('$pageview', {
      $current_url: `${window.location.origin}/blogs?page=2`,
    })

    nav.search = null
    rerender(<PosthogPageView />)

    expect(capture).toHaveBeenLastCalledWith('$pageview', {
      $current_url: `${window.location.origin}/blogs`,
    })
    expect(capture).toHaveBeenCalledTimes(2)
  })
})
