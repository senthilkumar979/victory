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

function mockMeetingsQuery(result: unknown) {
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

describe('useMeetingsForWeek IST bounds', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-03-01T06:30:00.000Z'))
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('builds a Monday week that crosses into the previous month and drops other IST days', async () => {
    const query = mockMeetingsQuery({
      data: [
        {
          id: 'before-monday',
          title: 'Too early',
          date: '2026-02-22T18:29:59.000Z',
          google_group_id: 'group-a',
          description: '',
          meeting_link: '',
          cover_image_url: '',
          attendance: null,
        },
        {
          id: 'monday-midnight-ist',
          title: null,
          date: '2026-02-22T18:30:00.000Z',
          google_group_id: null,
          description: null,
          meeting_link: null,
          cover_image_url: null,
          attendance: null,
        },
        {
          id: 'missing-date',
          title: 'Undated',
          date: null,
          google_group_id: 'group-a',
          description: 'skip',
          meeting_link: '',
          cover_image_url: '',
          attendance: [],
        },
        {
          id: 'sunday-night-ist',
          title: '  Week close  ',
          date: '2026-03-01T18:29:59.000Z',
          google_group_id: 'group-b',
          description: 'Still Sunday in IST',
          meeting_link: 'https://meet.example.com/sun',
          cover_image_url: '',
          attendance: [4, '1'],
        },
        {
          id: 'next-monday-ist',
          title: 'Next week',
          date: '2026-03-01T18:30:00.000Z',
          google_group_id: 'group-b',
          description: '',
          meeting_link: '',
          cover_image_url: '',
          attendance: [],
        },
      ],
      error: null,
    })

    const { result } = renderHook(() => useMeetingsForWeek())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(query.gte).toHaveBeenCalledWith('date', '2026-02-23T00:00:00.000Z')
    expect(query.lte).toHaveBeenCalledWith('date', '2026-03-01T23:59:59.999Z')
    expect(result.current.weekDays.map((day) => day.key)).toEqual([
      '2026-02-23',
      '2026-02-24',
      '2026-02-25',
      '2026-02-26',
      '2026-02-27',
      '2026-02-28',
      '2026-03-01',
    ])
    expect(result.current.weekDays.map((day) => day.label)).toEqual([
      '23/02',
      '24/02',
      '25/02',
      '26/02',
      '27/02',
      '28/02',
      '01/03',
    ])
    expect(result.current.weekDays.map((day) => day.dayName)).toEqual([
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ])
    expect(result.current.meetingsByDay['2026-02-23']).toEqual([
      {
        id: 'monday-midnight-ist',
        title: '',
        date: '2026-02-22T18:30:00.000Z',
        googleGroupId: '',
        description: '',
        meetingLink: '',
        coverImageUrl: '',
        attendance: undefined,
      },
    ])
    expect(result.current.meetingsByDay['2026-03-01']).toEqual([
      expect.objectContaining({
        id: 'sunday-night-ist',
        title: '  Week close  ',
        attendance: [1, 4],
      }),
    ])
    const placedIds = Object.values(result.current.meetingsByDay)
      .flat()
      .map((meeting) => meeting.id)
    expect(placedIds).not.toContain('before-monday')
    expect(placedIds).not.toContain('missing-date')
    expect(placedIds).not.toContain('next-monday-ist')
    expect(result.current.error).toBeNull()
  })

  it('uses a generic message when the query fails with a non-Error', async () => {
    mockMeetingsQuery({
      data: [{ id: 'ignored', title: 'Should not render', date: '2026-03-01T06:30:00.000Z' }],
      error: { message: 'permission denied', code: '42501' },
    })

    const { result } = renderHook(() => useMeetingsForWeek())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Failed to fetch meetings')
    expect(result.current.meetingsByDay).toEqual({})
    expect(result.current.weekDays).toHaveLength(7)
  })
})
