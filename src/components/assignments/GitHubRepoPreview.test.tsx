import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GitHubRepoPreview } from './GitHubRepoPreview'

vi.mock('@/components/assignments/MarkdownContent', () => ({
  MarkdownContent: ({ content }: { content: string }) => <p>{content}</p>,
}))

vi.mock('@/components/assignments/MonacoReadOnlyViewer', () => ({
  MonacoReadOnlyViewer: ({ path, language }: { path: string; language: string }) => (
    <pre data-testid="monaco">{`${path}:${language}`}</pre>
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

describe('GitHubRepoPreview', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('renders nothing for a blank repo URL and does not fetch', () => {
    const { container } = render(<GitHubRepoPreview repoUrl="   " />)

    expect(container).toBeEmptyDOMElement()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('surfaces API errors and a generic fallback for non-Error rejects', async () => {
    vi.mocked(fetch).mockImplementation((input) => {
      const url = String(input)
      if (url.includes('/api/github/repo')) {
        return jsonResponse({ error: 'Repo not found' })
      }
      return jsonResponse({})
    })

    const { rerender } = render(
      <GitHubRepoPreview repoUrl="https://github.com/org/missing" />,
    )

    expect(
      await screen.findByText('Repo not found'),
    ).toBeInTheDocument()

    vi.mocked(fetch).mockRejectedValueOnce('boom')
    rerender(<GitHubRepoPreview repoUrl="https://github.com/org/other" />)

    expect(
      await screen.findByText('Failed to load repository'),
    ).toBeInTheDocument()
  })

  it('loads the tree, skips unsupported files, and opens supported ones', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockImplementation((input) => {
      const url = String(input)
      if (url.includes('/api/github/repo')) {
        return jsonResponse({
          meta: { name: 'victory', defaultBranch: 'main', stars: 2 },
        })
      }
      if (url.includes('/api/github/readme')) {
        return jsonResponse({ content: 'Hello README' })
      }
      if (url.includes('/api/github/file')) {
        return jsonResponse({
          file: { path: 'src/app.ts', content: 'export {}', language: 'typescript' },
        })
      }
      if (url.includes('path=src')) {
        return jsonResponse({
          tree: [{ name: 'app.ts', path: 'src/app.ts', type: 'file' }],
        })
      }
      return jsonResponse({
        tree: [
          { name: 'src', path: 'src', type: 'dir' },
          { name: 'logo.png', path: 'logo.png', type: 'file' },
        ],
      })
    })

    render(<GitHubRepoPreview repoUrl="https://github.com/org/victory" />)

    expect(await screen.findByText('victory')).toBeInTheDocument()
    expect(screen.getByText('Hello README')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /logo.png/ }))
    expect(
      vi.mocked(fetch).mock.calls.some((call) =>
        String(call[0]).includes('/api/github/file'),
      ),
    ).toBe(false)

    await user.click(screen.getByRole('button', { name: /src/ }))
    expect(await screen.findByRole('button', { name: /app.ts/ })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /src/ }))
    expect(
      vi.mocked(fetch).mock.calls.filter((call) =>
        String(call[0]).includes('path=src'),
      ),
    ).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: /app.ts/ }))
    await waitFor(() =>
      expect(screen.getByTestId('monaco')).toHaveTextContent(
        'src/app.ts:typescript',
      ),
    )
  })
})
