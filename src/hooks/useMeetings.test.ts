import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useMeetings } from './useMeetings'
import { toISTTimestamptz } from '@/utils/dateISTUtils'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

const SELECT_COLS =
  'id, title, date, google_group_id, description, meeting_link, cover_image_url, feedback_form, feedback_email_sent_at, attendance'

interface ListQuery {
  select: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  range: ReturnType<typeof vi.fn>
  then: (
    onFulfilled: (value: { data: unknown; error: unknown; count?: number | null }) => unknown,
  ) => Promise<unknown>
}

function createListQuery(result: {
  data: unknown
  error: unknown
  count?: number | null
}): ListQuery {
  const query = {
    select: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
    then(
      onFulfilled: (value: {
        data: unknown
        error: unknown
        count?: number | null
      }) => unknown,
    ) {
      return Promise.resolve(result).then(onFulfilled)
    },
  }
  query.select.mockReturnValue(query)
  query.order.mockReturnValue(query)
  query.range.mockReturnValue(query)
  return query
}

interface InsertQuery {
  insert: ReturnType<typeof vi.fn>
  select: ReturnType<typeof vi.fn>
  single: ReturnType<typeof vi.fn>
}

function createInsertQuery(result: { data: unknown; error: unknown }): InsertQuery {
  const query = {
    insert: vi.fn(),
    select: vi.fn(),
    single: vi.fn().mockResolvedValue(result),
  }
  query.insert.mockReturnValue(query)
  query.select.mockReturnValue(query)
  return query
}

const meetingForm = {
  title: 'Weekly sync',
  date: '2026-03-15',
  googleGroupId: 'group-1',
  description: 'Discuss progress',
  meetingLink: 'https://meet.example.com/weekly',
  coverImageUrl: 'https://img.example.com/cover.png',
}

afterEach(() => {
  cleanup()
})

describe('useMeetings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('maps attendance to unique positive numbers and fills missing fields', async () => {
    const query = createListQuery({
      data: [
        {
          id: 'm1',
          title: null,
          date: null,
          google_group_id: null,
          description: null,
          meeting_link: null,
          cover_image_url: null,
          feedback_form: null,
          feedback_email_sent_at: null,
          attendance: [3, '1', 0, -2, 'x', 2],
        },
      ],
      error: null,
    })
    fromMock.mockReturnValue(query)

    const { result } = renderHook(() => useMeetings())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(fromMock).toHaveBeenCalledWith('meetings')
    expect(query.select).toHaveBeenCalledWith(SELECT_COLS, undefined)
    expect(query.order).toHaveBeenCalledWith('date', { ascending: false })
    expect(query.range).not.toHaveBeenCalled()
    expect(result.current.totalCount).toBe(1)
    expect(result.current.meetings).toEqual([
      {
        id: 'm1',
        title: '',
        date: '',
        googleGroupId: '',
        description: '',
        meetingLink: '',
        coverImageUrl: '',
        feedbackForm: undefined,
        feedbackEmailSentAt: undefined,
        attendance: [1, 2, 3],
      },
    ])
  })

  it('omits attendance when every value is invalid and paginates with an exact count', async () => {
    const query = createListQuery({
      data: [{ id: 'm2', title: 'Office hours', attendance: [0, 'nope'] }],
      error: null,
      count: 42,
    })
    fromMock.mockReturnValue(query)

    const { result } = renderHook(() => useMeetings({ page: 2, pageLimit: 10 }))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(query.select).toHaveBeenCalledWith(SELECT_COLS, { count: 'exact' })
    expect(query.range).toHaveBeenCalledWith(10, 19)
    expect(result.current.totalCount).toBe(42)
    expect(result.current.meetings[0]?.attendance).toBeUndefined()
  })

  it('does not paginate when pageLimit is 0', async () => {
    const query = createListQuery({ data: [], error: null, count: 9 })
    fromMock.mockReturnValue(query)

    const { result } = renderHook(() => useMeetings({ page: 3, pageLimit: 0 }))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(query.select).toHaveBeenCalledWith(SELECT_COLS, undefined)
    expect(query.range).not.toHaveBeenCalled()
    expect(result.current.totalCount).toBe(0)
  })

  it('inserts an IST date payload and omits feedback_form unless provided', async () => {
    const listQuery = createListQuery({ data: [], error: null })
    const insertQuery = createInsertQuery({ data: { id: 'created-1' }, error: null })
    Object.assign(listQuery, { insert: insertQuery.insert })
    insertQuery.insert.mockReturnValue(insertQuery)
    fromMock.mockReturnValue(listQuery)

    const { result } = renderHook(() => useMeetings())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let created: { id: string } | undefined
    await act(async () => {
      created = await result.current.createMeeting(meetingForm)
    })

    expect(insertQuery.insert).toHaveBeenCalledWith({
      title: 'Weekly sync',
      date: toISTTimestamptz('2026-03-15'),
      google_group_id: 'group-1',
      description: 'Discuss progress',
      meeting_link: 'https://meet.example.com/weekly',
      cover_image_url: 'https://img.example.com/cover.png',
    })
    expect(created).toEqual({ id: 'created-1' })

    await act(async () => {
      await result.current.createMeeting({
        ...meetingForm,
        feedbackForm: 'https://forms.example.com/feedback',
      })
    })

    expect(insertQuery.insert).toHaveBeenLastCalledWith(
      expect.objectContaining({
        feedback_form: 'https://forms.example.com/feedback',
      }),
    )
  })

  it('throws when create returns no id and maps Postgrest fetch errors to a fallback', async () => {
    const insertQuery = createInsertQuery({ data: {}, error: null })
    fromMock
      .mockReturnValueOnce(createListQuery({ data: [], error: null }))
      .mockReturnValueOnce(insertQuery)

    const { result } = renderHook(() => useMeetings())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await expect(result.current.createMeeting(meetingForm)).rejects.toThrow(
      'Meeting created but no id returned',
    )

    fromMock.mockReturnValue(
      createListQuery({ data: null, error: { message: 'timeout' } }),
    )
    await act(async () => {
      await result.current.refetch()
    })
    expect(result.current.error).toBe('Failed to fetch meetings')
  })
})
