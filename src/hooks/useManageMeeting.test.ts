import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useManageMeeting } from './useManageMeeting'

const { gooeyToast } = vi.hoisted(() => ({
  gooeyToast: {
    info: vi.fn(() => 'toast-1'),
    update: vi.fn(),
    dismiss: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('goey-toast', () => ({ gooeyToast }))

const payload = {
  title: 'Weekly sync',
  date: '2026-08-30T10:00:00.000Z',
  description: 'Agenda',
  googleGroupId: 'team@googlegroups.com',
  meetingLink: '',
  coverImageUrl: '',
}

function jsonResponse(
  body: unknown,
  ok = true,
  status = 200,
): Response {
  return {
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response
}

describe('useManageMeeting', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  async function runPipeline(
    createMeeting = vi.fn().mockResolvedValue({ id: 'meeting-1' }),
    updateMeeting = vi.fn().mockResolvedValue(undefined),
  ) {
    const { result } = renderHook(() =>
      useManageMeeting({ createMeeting, updateMeeting }),
    )
    const pending = result.current.createMeetingWithPipeline(payload)
    await vi.runAllTimersAsync()
    return { pending, createMeeting, updateMeeting }
  }

  it('retries a failed feedback form, then saves Meet + form URLs', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ error: 'busy' }, false, 503))
      .mockResolvedValueOnce(
        jsonResponse({ feedbackFormUrl: 'https://forms.gle/week1' }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ meetingLink: 'https://meet.google.com/abc-defg-hij' }),
      )

    const { pending, updateMeeting } = await runPipeline()
    await expect(pending).resolves.toEqual({ id: 'meeting-1' })

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      '/api/meetings/create-feedback-form',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          meetingId: 'meeting-1',
          meetingTitle: 'Weekly sync',
        }),
      }),
    )
    expect(fetch).toHaveBeenCalledWith(
      '/api/meetings/create-google-meet',
      expect.objectContaining({
        body: JSON.stringify({
          title: 'Weekly sync',
          date: payload.date,
          description: 'Agenda',
          googleGroupId: 'team@googlegroups.com',
          attendees: ['team@googlegroups.com'],
        }),
      }),
    )
    expect(updateMeeting).toHaveBeenCalledWith(
      'meeting-1',
      expect.objectContaining({
        feedbackForm: 'https://forms.gle/week1',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
      }),
    )
    expect(gooeyToast.success).toHaveBeenCalledWith(
      'Meeting created and calendar invite sent.',
      expect.any(Object),
    )
  })

  it('saves the meeting without a calendar invite after Meet retries fail', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        jsonResponse({ feedbackFormUrl: 'https://forms.gle/week1' }),
      )
      .mockResolvedValueOnce(jsonResponse({}, false, 500))
      .mockResolvedValueOnce(jsonResponse({}, false, 500))
      .mockResolvedValueOnce(jsonResponse({ meetingLink: '   ' }))

    const { pending, updateMeeting } = await runPipeline()
    await expect(pending).resolves.toEqual({ id: 'meeting-1' })

    expect(fetch).toHaveBeenCalledTimes(4)
    expect(updateMeeting).toHaveBeenCalledWith(
      'meeting-1',
      expect.objectContaining({
        feedbackForm: 'https://forms.gle/week1',
      }),
    )
    expect(updateMeeting.mock.calls[0][1].meetingLink).toBe('')
    expect(gooeyToast.warning).toHaveBeenCalledWith(
      'Meeting saved without calendar invite.',
      expect.any(Object),
    )
  })

  it('does not update when the initial create fails', async () => {
    const createMeeting = vi.fn().mockRejectedValue(new Error('insert failed'))
    const updateMeeting = vi.fn()
    const { result } = renderHook(() =>
      useManageMeeting({ createMeeting, updateMeeting }),
    )
    const pending = result.current.createMeetingWithPipeline(payload)
    const expected = expect(pending).rejects.toThrow('insert failed')
    await vi.runAllTimersAsync()
    await expected

    expect(fetch).not.toHaveBeenCalled()
    expect(updateMeeting).not.toHaveBeenCalled()
    expect(gooeyToast.error).toHaveBeenCalledWith(
      'Failed to create meeting.',
      expect.objectContaining({
        description: 'insert failed',
      }),
    )
  })
})
