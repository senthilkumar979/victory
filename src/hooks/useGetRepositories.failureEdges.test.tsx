import { cleanup, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  vi.resetModules()
})

function jsonResponse(
  body: unknown,
  init?: { ok?: boolean; statusText?: string },
) {
  return {
    ok: init?.ok ?? true,
    statusText: init?.statusText ?? 'OK',
    json: async () => body,
  }
}

async function renderRepositories(profileUrl: string) {
  vi.resetModules()
  vi.stubEnv('NEXT_PUBLIC_GITHUB_TOKEN', '')
  const { AppContext } = await import('../app/contexts/AppContext')
  const { useGetRepositories } = await import('./useGetRepositores')
  const dispatch = vi.fn()

  function wrapper({ children }: { children: ReactNode }) {
    return (
      <AppContext.Provider
        value={{ repositories: [], blogs: [], awards: [], dispatch }}
      >
        {children}
      </AppContext.Provider>
    )
  }

  const view = renderHook(() => useGetRepositories(profileUrl), { wrapper })
  return { ...view, dispatch }
}

const profileUrl = 'https://github.com/ada'

describe('useGetRepositories failure edges', () => {
  it('uses the HTTP status text when GitHub omits an error message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({}, { ok: false, statusText: 'Not Found' }),
      ),
    )

    const { result, dispatch } = await renderRepositories(profileUrl)
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Failed to fetch repositories: Not Found')
    expect(result.current.repositories).toEqual([])
    expect(dispatch).not.toHaveBeenCalled()
  })

  it('uses the HTTP status text when the error body is not JSON', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Bad Gateway',
        json: async () => {
          throw new Error('invalid json')
        },
      }),
    )

    const { result } = await renderRepositories(profileUrl)
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe(
      'Failed to fetch repositories: Bad Gateway',
    )
  })

  it('uses a generic message when fetch rejects with a non-Error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue('timeout'))

    const { result } = await renderRepositories(profileUrl)
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Failed to fetch repositories')
    expect(result.current.repositories).toEqual([])
  })

  it('keeps an Error message when the request throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('socket hang up')),
    )

    const { result } = await renderRepositories(profileUrl)
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('socket hang up')
  })
})
