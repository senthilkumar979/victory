import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useMeetingsForWeek } from './useMeetingsForWeek'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

interface MeetingsQuery {
  select: ReturnType<typeof vi.fn>
  gte: ReturnType<typeof vi.fn>
  lte: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
}

function mockMeetingsQuery(result: unknown): MeetingsQuery {
  const query = {
    select: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    order: vi.fn().mockResolvedValue(result),
  }
  query.select.mockReturnValue(query)
  query.gte.mockReturnValue(query)
  query.lte.mockReturnValue(query)
  fromMock.mockReturnValue(query)
  return query
}

describe('useMeetingsForWeek', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-06-03T12:00:00.000Z'))
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('queries the current week and groups meetings by their IST date', async () => {
    const query = mockMeetingsQuery({
      data: [
        {
          id: 'meeting-monday',
          title: 'Monday sync',
          date: '2026-06-01T03:30:00.000Z',
          google_group_id: 'group-a',
          description: 'Kickoff',
          meeting_link: 'https://meet.example.com/monday',
          cover_image_url: 'https://img.example.com/monday.png',
          attendance: ['9', 'bad', 2, 0, -1],
        },
        {
          id: 'meeting-tuesday-ist',
          title: 'Late UTC session',
          date: '2026-06-01T18:45:00.000Z',
          google_group_id: 'group-b',
          description: 'Falls on Tuesday in IST',
          meeting_link: '',
          cover_image_url: '',
          attendance: [],
        },
      ],
      error: null,
    })

    const { result } = renderHook(() => useMeetingsForWeek())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fromMock).toHaveBeenCalledWith('meetings')
    expect(query.select).toHaveBeenCalledWith(
      'id, title, date, google_group_id, description, meeting_link, cover_image_url, attendance',
    )
    expect(query.gte).toHaveBeenCalledWith(
      'date',
      '2026-06-01T00:00:00.000Z',
    )
    expect(query.lte).toHaveBeenCalledWith(
      'date',
      '2026-06-07T23:59:59.999Z',
    )
    expect(query.order).toHaveBeenCalledWith('date', { ascending: true })
    expect(result.current.weekDays.map((day) => day.key)).toEqual([
      '2026-06-01',
      '2026-06-02',
      '2026-06-03',
      '2026-06-04',
      '2026-06-05',
      '2026-06-06',
      '2026-06-07',
    ])
    expect(result.current.meetingsByDay['2026-06-01']).toEqual([
      expect.objectContaining({
        id: 'meeting-monday',
        title: 'Monday sync',
        attendance: [2, 9],
      }),
    ])
    expect(result.current.meetingsByDay['2026-06-02']).toEqual([
      expect.objectContaining({
        id: 'meeting-tuesday-ist',
        title: 'Late UTC session',
        attendance: undefined,
      }),
    ])
    expect(result.current.error).toBeNull()
  })

  it('surfaces Supabase errors and stops loading', async () => {
    mockMeetingsQuery({
      data: null,
      error: new Error('database unavailable'),
    })

    const { result } = renderHook(() => useMeetingsForWeek())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('database unavailable')
    expect(result.current.meetingsByDay).toEqual({})
  })
})
