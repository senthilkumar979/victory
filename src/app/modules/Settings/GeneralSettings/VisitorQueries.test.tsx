import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { VisitorQueries } from './VisitorQueries'

const originalFetch = globalThis.fetch

beforeEach(() => {
  globalThis.fetch = vi.fn()
})

afterEach(() => {
  cleanup()
  globalThis.fetch = originalFetch
})

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }
}

describe('VisitorQueries', () => {
  it('shows the API error instead of the empty-state copy', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      jsonResponse({ error: 'Admins only' }, 403) as Response,
    )

    render(<VisitorQueries />)

    expect(
      await screen.findByText('Admins only'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/No queries recorded yet/),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('falls back when the error payload has no message and on network failure', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      jsonResponse({}, 500) as Response,
    )

    const { rerender } = render(<VisitorQueries />)
    expect(
      await screen.findByText('Failed to load queries'),
    ).toBeInTheDocument()

    vi.mocked(globalThis.fetch).mockRejectedValue(new Error('offline'))
    rerender(<VisitorQueries />)
    await userEvent.setup().click(screen.getByRole('button', { name: /Refresh/ }))

    expect(
      await screen.findByText('Network error while loading queries.'),
    ).toBeInTheDocument()
  })

  it('renders queries, treats a missing list as empty, and uses an em dash for null counts', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      jsonResponse({}) as Response,
    )

    const { unmount } = render(<VisitorQueries />)
    expect(
      await screen.findByText(/No queries recorded yet/),
    ).toBeInTheDocument()
    unmount()

    vi.mocked(globalThis.fetch).mockResolvedValue(
      jsonResponse({
        queries: [
          {
            id: 'q1',
            created_at: '2026-09-16T12:00:00.000Z',
            query_text: 'How do I join MentorBridge?',
            thread_message_count: null,
          },
        ],
      }) as Response,
    )

    render(<VisitorQueries />)

    expect(
      await screen.findByText('How do I join MentorBridge?'),
    ).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/admin/visitor-chat-queries',
        { credentials: 'same-origin' },
      )
    })
  })
})
