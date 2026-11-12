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

function jsonResponse(body: unknown) {
  return {
    ok: true,
    statusText: 'OK',
    json: async () => body,
  }
}

const repoRow = {
  id: 1,
  name: 'victory',
  full_name: 'ada/victory',
  description: null,
  html_url: 'https://github.com/ada/victory',
  stargazers_count: 2,
  updated_at: '2026-02-01T00:00:00Z',
}

async function renderRepositories(profileUrl: string, token = '') {
  vi.resetModules()
  vi.stubEnv('NEXT_PUBLIC_GITHUB_TOKEN', token)
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

describe('useGetRepositories profile URLs', () => {
  it.each([
    'https://github.com/ada?tab=repositories',
    'https://www.github.com/ada/',
    'http://github.com/ada',
  ])('loads repositories for a single-segment profile URL (%s)', async (profileUrl) => {
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse([]))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = await renderRepositories(profileUrl)
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.github.com/users/ada/repos?per_page=100&sort=updated',
      { headers: { Accept: 'application/vnd.github+json' } },
    )
    expect(result.current.error).toBeNull()
  })

  it('treats a null language payload as an empty map', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([repoRow]))
      .mockResolvedValueOnce(jsonResponse(null))
    vi.stubGlobal('fetch', fetchMock)

    const { result, dispatch } = await renderRepositories('https://github.com/ada')
    await waitFor(() => expect(result.current.repositories).toHaveLength(1))

    expect(result.current.error).toBeNull()
    expect(result.current.repositories[0]?.languages).toEqual({})
    expect(dispatch).toHaveBeenCalledTimes(1)
  })

  it('fails the whole list when a language payload is not JSON', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([repoRow]))
      .mockResolvedValueOnce({
        ok: true,
        statusText: 'OK',
        json: async () => {
          throw new Error('Unexpected token')
        },
      })
    vi.stubGlobal('fetch', fetchMock)

    const { result, dispatch } = await renderRepositories('https://github.com/ada')
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Unexpected token')
    expect(result.current.repositories).toEqual([])
    expect(dispatch).not.toHaveBeenCalled()
  })

  it('sends the GitHub token as a bearer header when it is configured', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = await renderRepositories(
      'https://github.com/ada',
      'ghp_test_token',
    )
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.github.com/users/ada/repos?per_page=100&sort=updated',
      {
        headers: {
          Authorization: 'Bearer ghp_test_token',
          Accept: 'application/vnd.github+json',
        },
      },
    )
  })
})
