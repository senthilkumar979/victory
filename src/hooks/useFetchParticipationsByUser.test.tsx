import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useFetchParticipationsByUser } from './useFetchParticipationsByUser'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

interface ParticipationQuery {
  select: ReturnType<typeof vi.fn>
  contains: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
}

function mockParticipationQuery(result: unknown): ParticipationQuery {
  const query = {
    select: vi.fn(),
    contains: vi.fn(),
    order: vi.fn().mockResolvedValue(result),
  }
  query.select.mockReturnValue(query)
  query.contains.mockReturnValue(query)
  fromMock.mockReturnValue(query)
  return query
}

describe('useFetchParticipationsByUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('skips Supabase when the serial number is missing or invalid', async () => {
    const { result } = renderHook(() => useFetchParticipationsByUser(undefined))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fromMock).not.toHaveBeenCalled()
    expect(result.current.participations).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('fetches meetings containing the member serial number', async () => {
    const query = mockParticipationQuery({
      data: [
        {
          id: 'meeting-1',
          title: 'Weekly sync',
          date: '2026-06-01T12:00:00.000Z',
          google_group_id: 'group-1',
          description: 'Discuss progress',
          meeting_link: 'https://meet.example.com/weekly',
          cover_image_url: 'https://img.example.com/cover.png',
          feedback_form: 'https://forms.example.com/feedback',
        },
      ],
      error: null,
    })

    const { result } = renderHook(() => useFetchParticipationsByUser(17))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fromMock).toHaveBeenCalledWith('meetings')
    expect(query.contains).toHaveBeenCalledWith('attendance', [17])
    expect(query.order).toHaveBeenCalledWith('date', { ascending: false })
    expect(result.current.participations).toEqual([
      {
        id: 'meeting-1',
        title: 'Weekly sync',
        date: '2026-06-01T12:00:00.000Z',
        googleGroupId: 'group-1',
        description: 'Discuss progress',
        meetingLink: 'https://meet.example.com/weekly',
        coverImageUrl: 'https://img.example.com/cover.png',
        feedbackForm: 'https://forms.example.com/feedback',
      },
    ])
  })
})
