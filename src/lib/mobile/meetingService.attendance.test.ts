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

import { updateMeetingAttendance } from '@/lib/mobile/meetingService'
import { MobileServiceError } from '@/lib/mobile/mobileApiUtils'

describe('updateMeetingAttendance', () => {
  const maybeSingle = vi.fn()
  const select = vi.fn()
  const eq = vi.fn()
  const update = vi.fn()
  const from = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    maybeSingle.mockResolvedValue({
      data: {
        id: 'meeting-1',
        title: 'Weekly sync',
        date: '2026-07-24T10:00:00.000Z',
        google_group_id: 'group-1',
        description: 'Attendance check',
        meeting_link: 'https://meet.example.com/1',
        cover_image_url: '',
        feedback_form: null,
        feedback_email_sent_at: null,
        attendance: [1, 4],
      },
      error: null,
    })
    select.mockReturnValue({ maybeSingle })
    eq.mockReturnValue({ select })
    update.mockReturnValue({ eq })
    from.mockReturnValue({ update })
    getMobileDbMock.mockReturnValue({ from })
  })

  it('persists only positive numeric attendance ids in ascending order', async () => {
    const meeting = await updateMeetingAttendance('meeting-1', [
      4,
      Number.NaN,
      1,
      0,
      -2,
      '3' as unknown as number,
    ])

    expect(from).toHaveBeenCalledWith('meetings')
    expect(update).toHaveBeenCalledWith({ attendance: [1, 3, 4] })
    expect(eq).toHaveBeenCalledWith('id', 'meeting-1')
    expect(meeting).toMatchObject({
      id: 'meeting-1',
      attendance: [1, 4],
    })
  })

  it('throws NOT_FOUND when the meeting row is missing', async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null })

    try {
      await updateMeetingAttendance('missing', [1, 2])
      expect.unreachable('updateMeetingAttendance should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(MobileServiceError)
      expect(error).toMatchObject({
        message: 'Meeting not found',
        status: 404,
        code: 'NOT_FOUND',
      })
    }
  })
})
