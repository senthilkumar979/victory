import { cleanup, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AppContext } from '../app/contexts/AppContext'
import { useGetRepositories } from './useGetRepositores'

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

function jsonResponse(body: unknown, init?: { ok?: boolean; statusText?: string }) {
  return {
    ok: init?.ok ?? true,
    statusText: init?.statusText ?? 'OK',
    json: async () => body,
  }
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('useGetRepositories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it.each([
    undefined,
    null,
    '',
    '   ',
    'https://github.com/ada/repo',
    'not a url',
  ])('skips GitHub when the profile URL cannot yield a username (%s)', async (profileUrl) => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useGetRepositories(profileUrl), {
      wrapper,
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.current.repositories).toEqual([])
    expect(result.current.error).toBeNull()
    expect(dispatch).not.toHaveBeenCalled()
  })

  it('maps repos and treats a failed language request as an empty map', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse([
          {
            id: 1,
            name: 'victory',
            full_name: 'ada/victory',
            description: null,
            html_url: 'https://github.com/ada/victory',
            stargazers_count: 3,
            updated_at: '2026-01-01T00:00:00Z',
          },
        ]),
      )
      .mockResolvedValueOnce(jsonResponse({}, { ok: false, statusText: 'Rate Limited' }))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(
      () => useGetRepositories('github.com/ada'),
      { wrapper },
    )
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://api.github.com/users/ada/repos?per_page=100&sort=updated',
      { headers: { Accept: 'application/vnd.github+json' } },
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://api.github.com/repos/ada/victory/languages',
      { headers: { Accept: 'application/vnd.github+json' } },
    )
    expect(result.current.repositories).toEqual([
      {
        id: 1,
        name: 'victory',
        fullName: 'ada/victory',
        description: null,
        htmlUrl: 'https://github.com/ada/victory',
        stargazersCount: 3,
        updated_at: '2026-01-01T00:00:00Z',
        languages: {},
      },
    ])
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_REPOSITORIES',
      payload: result.current.repositories,
    })
  })

  it('uses the GitHub error message when the repo list request fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ message: 'Bad credentials' }, { ok: false, statusText: 'Unauthorized' }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(
      () => useGetRepositories('https://github.com/ada/'),
      { wrapper },
    )
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Bad credentials')
    expect(result.current.repositories).toEqual([])
    expect(dispatch).not.toHaveBeenCalled()
  })
})
