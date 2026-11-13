import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GitHubRepoPreview } from './GitHubRepoPreview'

vi.mock('@/components/assignments/MarkdownContent', () => ({
  MarkdownContent: ({ content }: { content: string }) => <p>{content}</p>,
}))

vi.mock('@/components/assignments/MonacoReadOnlyViewer', () => ({
  MonacoReadOnlyViewer: ({ path }: { path: string }) => (
    <pre data-testid="monaco">{path}</pre>
  ),
}))

function jsonResponse(body: unknown, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(body),
  } as Response)
}

afterEach(() => {
  cleanup()
})

describe('GitHubRepoPreview fallbacks', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('fills missing repo metadata and hides an empty description and README', async () => {
    vi.mocked(fetch).mockImplementation((input) => {
      const url = String(input)
      if (url.includes('/api/github/repo')) {
        return jsonResponse({ meta: { stars: 0 } })
      }
      if (url.includes('/api/github/readme')) {
        return jsonResponse({})
      }
      return jsonResponse({ tree: [] })
    })

    render(<GitHubRepoPreview repoUrl="https://github.com/org/victory" />)

    expect(await screen.findByRole('heading', { name: 'Repository' })).toBeInTheDocument()
    expect(screen.getByText(/Branch:\s*main/)).toHaveTextContent('⭐ 0')
    expect(screen.queryByRole('heading', { name: 'README' })).not.toBeInTheDocument()
    expect(screen.queryByText('Student work')).not.toBeInTheDocument()
  })

  it('shows a description when the repo metadata includes one', async () => {
    vi.mocked(fetch).mockImplementation((input) => {
      const url = String(input)
      if (url.includes('/api/github/repo')) {
        return jsonResponse({
          meta: {
            name: 'victory',
            defaultBranch: 'main',
            stars: 0,
            description: 'Student work',
          },
        })
      }
      if (url.includes('/api/github/readme')) return jsonResponse({ content: '' })
      return jsonResponse({ tree: [] })
    })

    render(<GitHubRepoPreview repoUrl="https://github.com/org/victory" />)

    expect(await screen.findByText('Student work')).toBeInTheDocument()
    expect(screen.getByText(/Branch:\s*main/)).toHaveTextContent('⭐ 0')
  })

  it('does not cache a failed directory load and retries on the next click', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockImplementation((input) => {
      const url = String(input)
      if (url.includes('/api/github/repo')) {
        return jsonResponse({ meta: { name: 'victory' } })
      }
      if (url.includes('/api/github/readme')) return jsonResponse({ content: '' })
      if (url.includes('path=')) return jsonResponse({ error: 'unavailable' }, false)
      return jsonResponse({
        tree: [{ name: 'src', path: 'src', type: 'dir' }],
      })
    })

    render(<GitHubRepoPreview repoUrl="https://github.com/org/victory" />)

    const folder = await screen.findByRole('button', { name: /src/ })
    await user.click(folder)
    await waitFor(() => {
      expect(
        vi.mocked(fetch).mock.calls.filter((call) =>
          String(call[0]).includes('path=src'),
        ),
      ).toHaveLength(1)
    })

    await user.click(folder)

    await waitFor(() => {
      expect(
        vi.mocked(fetch).mock.calls.filter((call) =>
          String(call[0]).includes('path=src'),
        ),
      ).toHaveLength(2)
    })
    expect(screen.queryByRole('button', { name: /app.ts/ })).not.toBeInTheDocument()
  })

  it('does not open the editor when the file request fails', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockImplementation((input) => {
      const url = String(input)
      if (url.includes('/api/github/repo')) {
        return jsonResponse({ meta: { name: 'victory' } })
      }
      if (url.includes('/api/github/readme')) return jsonResponse({ content: '' })
      if (url.includes('/api/github/file')) {
        return jsonResponse({ error: 'nope' }, false)
      }
      return jsonResponse({
        tree: [{ name: 'app.ts', path: 'src/app.ts', type: 'file' }],
      })
    })

    render(<GitHubRepoPreview repoUrl="https://github.com/org/victory" />)

    await user.click(await screen.findByRole('button', { name: /app.ts/ }))

    await waitFor(() => {
      expect(
        vi.mocked(fetch).mock.calls.some((call) =>
          String(call[0]).includes('/api/github/file'),
        ),
      ).toBe(true)
    })
    await act(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 0)
      })
    })
    expect(screen.queryByTestId('monaco')).not.toBeInTheDocument()
  })
})
