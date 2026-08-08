import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LoaderProvider } from './Loader'

vi.mock('@/ui/atoms/loader/Loader', () => ({
  Loader: ({ isShow }: { isShow: boolean }) =>
    isShow ? <div role="status">Loading</div> : null,
}))

interface DeferredResponse {
  promise: Promise<Response>
  resolve: (response: Response) => void
}

function createDeferredResponse(): DeferredResponse {
  let resolve: DeferredResponse['resolve'] = () => {}
  const promise = new Promise<Response>((resolver) => {
    resolve = resolver
  })

  return { promise, resolve }
}

describe('LoaderProvider', () => {
  const originalFetch = window.fetch

  afterEach(() => {
    cleanup()
    window.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('shows and hides the overlay around loader-worthy fetches', async () => {
    const deferred = createDeferredResponse()
    const fetchMock = vi.fn().mockReturnValue(deferred.promise)
    window.fetch = fetchMock

    render(
      <LoaderProvider>
        <div>App content</div>
      </LoaderProvider>,
    )

    await waitFor(() => expect(window.fetch).not.toBe(fetchMock))

    let fetchPromise: Promise<Response> | undefined
    act(() => {
      fetchPromise = window.fetch('/api/students')
    })

    expect(await screen.findByRole('status')).toHaveTextContent('Loading')
    expect(fetchMock).toHaveBeenCalledWith('/api/students', undefined)

    await act(async () => {
      deferred.resolve(new Response(null, { status: 200 }))
      await fetchPromise
    })

    await waitFor(() =>
      expect(screen.queryByRole('status')).not.toBeInTheDocument(),
    )
  })
})
