import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { UserSearch } from './UserSearch'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

interface StudentQuery {
  select: ReturnType<typeof vi.fn>
  ilike: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
}

function mockStudentQuery(result: unknown): StudentQuery {
  const query = {
    select: vi.fn(),
    ilike: vi.fn(),
    limit: vi.fn().mockResolvedValue(result),
  }
  query.select.mockReturnValue(query)
  query.ilike.mockReturnValue(query)
  fromMock.mockReturnValue(query)
  return query
}

afterEach(() => {
  cleanup()
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('UserSearch', () => {
  it('does not query Supabase until two non-whitespace characters are typed', async () => {
    const user = userEvent.setup()
    render(<UserSearch onSelect={vi.fn()} />)

    await user.type(screen.getByPlaceholderText('Search students by name...'), ' A ')

    expect(
      screen.getByText('Type at least 2 characters to search students.'),
    ).toBeInTheDocument()
    expect(fromMock).not.toHaveBeenCalled()
  })

  it('maps social_links and selects the highlighted student', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const query = mockStudentQuery({
      data: [
        {
          id: 's1',
          name: 'Ada Lovelace',
          picture: '',
          role: 'Engineer',
          company: 'MentorBridge',
          email: 'ada@example.com',
          social_links: { linkedIn: 'https://in.example', gitHub: '', website: '' },
          batch: '2026',
        },
      ],
      error: null,
    })

    render(<UserSearch onSelect={onSelect} />)
    await user.type(screen.getByPlaceholderText('Search students by name...'), 'Ad')

    await waitFor(() => expect(fromMock).toHaveBeenCalledWith('students'))
    expect(query.ilike).toHaveBeenCalledWith('name', '%Ad%')
    expect(query.limit).toHaveBeenCalledWith(5)

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Ada Lovelace/ })).toBeInTheDocument(),
    )

    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 's1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        socialLinks: { linkedIn: 'https://in.example', gitHub: '', website: '' },
        batch: '2026',
      }),
    )
  })

  it('maps non-Error fetch failures to a generic message', async () => {
    const user = userEvent.setup()
    mockStudentQuery({ data: null, error: { message: 'permission denied' } })

    render(<UserSearch onSelect={vi.fn()} />)
    await user.type(screen.getByPlaceholderText('Search students by name...'), 'Ada')

    await waitFor(() =>
      expect(screen.getByText('Failed to search students')).toBeInTheDocument(),
    )
  })
})
