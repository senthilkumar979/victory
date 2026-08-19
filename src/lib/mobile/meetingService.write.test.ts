import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getMobileDbMock } = vi.hoisted(() => ({
  getMobileDbMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/mobile/mobileApiUtils', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@/lib/mobile/mobileApiUtils')>()
  return { ...original, getMobileDb: getMobileDbMock }
})

import {
  createMeeting,
  deleteMeeting,
  getMeetingById,
  updateMeeting,
} from '@/lib/mobile/meetingService'
import { MobileServiceError } from '@/lib/mobile/mobileApiUtils'

const meetingRow = {
  id: 'meeting-1',
  title: 'Sprint review',
  date: '2026-07-19T10:00:00.000Z',
  google_group_id: 'group-1',
  description: 'Notes',
  meeting_link: 'https://meet.example.com/1',
  cover_image_url: 'https://example.com/cover.webp',
  feedback_form: 'https://forms.example.com/1',
  feedback_email_sent_at: '2026-07-20T00:00:00.000Z',
  attendance: ['4', 0, 1, Number.NaN, -2],
}

const formPayload = {
  title: 'Sprint review',
  date: '2026-07-19T09:00:00Z',
  googleGroupId: 'group-1',
  description: 'Notes',
  meetingLink: 'https://meet.example.com/1',
  coverImageUrl: 'https://example.com/cover.webp',
}

describe('meetingService writes', () => {
  const maybeSingle = vi.fn()
  const single = vi.fn()
  const select = vi.fn()
  const eq = vi.fn()
  const insert = vi.fn()
  const update = vi.fn()
  const del = vi.fn()
  const from = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    maybeSingle.mockResolvedValue({ data: meetingRow, error: null })
    single.mockResolvedValue({ data: meetingRow, error: null })
    select.mockReturnValue({ single, maybeSingle })
    eq.mockReturnValue({ select })
    insert.mockReturnValue({ select })
    update.mockReturnValue({ eq })
    del.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
    from.mockReturnValue({ insert, update, delete: del, select })
    getMobileDbMock.mockReturnValue({ from })
  })

  it('maps getMeetingById rows and sanitizes attendance', async () => {
    const selectEq = vi.fn().mockReturnValue({ maybeSingle })
    select.mockReturnValue({ eq: selectEq, single, maybeSingle })

    const meeting = await getMeetingById('meeting-1')

    expect(from).toHaveBeenCalledWith('meetings')
    expect(selectEq).toHaveBeenCalledWith('id', 'meeting-1')
    expect(meeting).toMatchObject({
      id: 'meeting-1',
      title: 'Sprint review',
      googleGroupId: 'group-1',
      meetingLink: 'https://meet.example.com/1',
      coverImageUrl: 'https://example.com/cover.webp',
      feedbackForm: 'https://forms.example.com/1',
      attendance: [1, 4],
    })
  })

  it('throws NOT_FOUND and INTERNAL_ERROR from getMeetingById', async () => {
    const selectEq = vi.fn().mockReturnValue({ maybeSingle })
    select.mockReturnValue({ eq: selectEq, single, maybeSingle })

    maybeSingle.mockResolvedValueOnce({ data: null, error: null })
    try {
      await getMeetingById('missing')
      expect.unreachable('getMeetingById should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(MobileServiceError)
      expect(error).toMatchObject({
        message: 'Meeting not found',
        status: 404,
        code: 'NOT_FOUND',
      })
    }

    maybeSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'db down' },
    })
    await expect(getMeetingById('meeting-1')).rejects.toMatchObject({
      message: 'Could not load meeting.',
      status: 500,
      code: 'INTERNAL_ERROR',
    })
  })

  it('creates a meeting with IST timestamps and omits unused feedback_form', async () => {
    const meeting = await createMeeting(formPayload)

    expect(insert).toHaveBeenCalledWith({
      title: 'Sprint review',
      date: '2026-07-19T14:30:00+05:30',
      google_group_id: 'group-1',
      description: 'Notes',
      meeting_link: 'https://meet.example.com/1',
      cover_image_url: 'https://example.com/cover.webp',
    })
    expect(meeting.id).toBe('meeting-1')
  })

  it('includes feedback_form on create when provided', async () => {
    await createMeeting({
      ...formPayload,
      date: '2026-07-19',
      feedbackForm: 'https://forms.example.com/1',
    })

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        date: '2026-07-19T00:00:00+05:30',
        feedback_form: 'https://forms.example.com/1',
      }),
    )
  })

  it('throws INTERNAL_ERROR when create fails', async () => {
    single.mockResolvedValueOnce({ data: null, error: { message: 'db' } })

    await expect(createMeeting(formPayload)).rejects.toMatchObject({
      message: 'Could not create meeting.',
      status: 500,
      code: 'INTERNAL_ERROR',
    })
  })

  it('updates a meeting or throws NOT_FOUND when the row is missing', async () => {
    const meeting = await updateMeeting('meeting-1', {
      ...formPayload,
      date: '2026-07-20T18:00:00+05:30',
      feedbackForm: 'https://forms.example.com/2',
    })

    expect(update).toHaveBeenCalledWith({
      title: 'Sprint review',
      date: '2026-07-20T18:00:00+05:30',
      google_group_id: 'group-1',
      description: 'Notes',
      meeting_link: 'https://meet.example.com/1',
      cover_image_url: 'https://example.com/cover.webp',
      feedback_form: 'https://forms.example.com/2',
    })
    expect(eq).toHaveBeenCalledWith('id', 'meeting-1')
    expect(meeting.title).toBe('Sprint review')

    maybeSingle.mockResolvedValueOnce({ data: null, error: null })
    await expect(
      updateMeeting('missing', formPayload),
    ).rejects.toMatchObject({
      message: 'Meeting not found',
      status: 404,
      code: 'NOT_FOUND',
    })
  })

  it('deletes a meeting and maps database errors', async () => {
    const deleteEq = vi.fn().mockResolvedValue({ error: null })
    del.mockReturnValue({ eq: deleteEq })

    await deleteMeeting('meeting-1')
    expect(from).toHaveBeenCalledWith('meetings')
    expect(deleteEq).toHaveBeenCalledWith('id', 'meeting-1')

    deleteEq.mockResolvedValueOnce({ error: { message: 'fk' } })
    await expect(deleteMeeting('meeting-1')).rejects.toMatchObject({
      message: 'Could not delete meeting.',
      status: 500,
      code: 'INTERNAL_ERROR',
    })
  })
})
