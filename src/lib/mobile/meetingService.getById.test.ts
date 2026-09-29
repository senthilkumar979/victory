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

import { getMeetingById } from '@/lib/mobile/meetingService'

function mockMeetingQuery(result: { data: unknown; error: unknown }) {
  const maybeSingle = vi.fn().mockResolvedValue(result)
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ select }))
  getMobileDbMock.mockReturnValue({ from })
  return { eq }
}

describe('getMeetingById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('throws not found when the meeting row is missing', async () => {
    mockMeetingQuery({ data: null, error: null })

    await expect(getMeetingById('missing')).rejects.toMatchObject({
      message: 'Meeting not found',
      status: 404,
      code: 'NOT_FOUND',
    })
  })

  it('throws an internal error when the query fails', async () => {
    mockMeetingQuery({
      data: { id: 'meeting-1' },
      error: { message: 'db down' },
    })

    await expect(getMeetingById('meeting-1')).rejects.toMatchObject({
      message: 'Could not load meeting.',
      status: 500,
      code: 'INTERNAL_ERROR',
    })
  })

  it('sorts attendance and blanks missing text fields', async () => {
    const { eq } = mockMeetingQuery({
      data: {
        id: 'meeting-1',
        title: null,
        date: null,
        google_group_id: null,
        description: null,
        meeting_link: null,
        cover_image_url: null,
        feedback_form: null,
        feedback_email_sent_at: null,
        attendance: ['2', 0, -1, 'nope', 1],
      },
      error: null,
    })

    await expect(getMeetingById('meeting-1')).resolves.toEqual({
      id: 'meeting-1',
      title: '',
      date: '',
      googleGroupId: '',
      description: '',
      meetingLink: '',
      coverImageUrl: '',
      feedbackForm: undefined,
      feedbackEmailSentAt: undefined,
      attendance: [1, 2],
    })
    expect(eq).toHaveBeenCalledWith('id', 'meeting-1')
  })

  it('omits attendance when every stored value is invalid', async () => {
    mockMeetingQuery({
      data: {
        id: 'meeting-2',
        title: 'Standup',
        date: '2026-07-19T10:00:00.000Z',
        google_group_id: 'group-1',
        description: 'Notes',
        meeting_link: '',
        cover_image_url: '',
        feedback_form: '',
        feedback_email_sent_at: '',
        attendance: [0, -3, 'x'],
      },
      error: null,
    })

    const meeting = await getMeetingById('meeting-2')

    expect(meeting.attendance).toBeUndefined()
    expect(meeting.feedbackForm).toBe('')
  })
})
