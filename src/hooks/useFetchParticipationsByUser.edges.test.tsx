import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useFetchParticipationsByUser } from './useFetchParticipationsByUser'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

function mockParticipationQuery(result: unknown) {
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

describe('useFetchParticipationsByUser edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not query when the serial number is zero or negative', async () => {
    const { result, rerender } = renderHook(
      ({ serialNo }: { serialNo: number }) =>
        useFetchParticipationsByUser(serialNo),
      { initialProps: { serialNo: 0 } },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(fromMock).not.toHaveBeenCalled()
    expect(result.current.participations).toEqual([])

    rerender({ serialNo: -1 })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(fromMock).not.toHaveBeenCalled()
  })

  it('maps null meeting fields to empty strings and drops a null feedback form', async () => {
    mockParticipationQuery({
      data: [
        {
          id: 'meeting-2',
          title: null,
          date: null,
          google_group_id: null,
          description: null,
          meeting_link: null,
          cover_image_url: null,
          feedback_form: null,
        },
        {
          id: 'meeting-3',
          title: 'Office hours',
          date: '2026-06-02T12:00:00.000Z',
          google_group_id: 'group-2',
          description: '',
          meeting_link: '',
          cover_image_url: '',
          feedback_form: '',
        },
      ],
      error: null,
    })

    const { result } = renderHook(() => useFetchParticipationsByUser(4))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBeNull()
    expect(result.current.participations[0]).toEqual({
      id: 'meeting-2',
      title: '',
      date: '',
      googleGroupId: '',
      description: '',
      meetingLink: '',
      coverImageUrl: '',
      feedbackForm: undefined,
    })
    expect(result.current.participations[1]?.feedbackForm).toBe('')
  })

  it('surfaces Error messages and clears meetings when the query fails', async () => {
    mockParticipationQuery({
      data: [{ id: 'stale' }],
      error: new Error('permission denied'),
    })

    const { result } = renderHook(() => useFetchParticipationsByUser(9))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('permission denied')
    expect(result.current.participations).toEqual([])
  })

  it('uses a fallback message when the query failure is not an Error', async () => {
    mockParticipationQuery({
      data: null,
      error: { message: 'row level security' },
    })

    const { result } = renderHook(() => useFetchParticipationsByUser(9))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Failed to load participations')
    expect(result.current.participations).toEqual([])
  })
})
