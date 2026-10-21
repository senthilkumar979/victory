import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { MeetingFormState } from '@/app/modules/Meetings/Meeting.types'

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

const basePayload: Omit<MeetingFormState, 'id'> = {
  title: 'Weekly sync',
  date: '2026-08-30T10:00:00.000Z',
  description: 'Agenda',
  googleGroupId: 'team@googlegroups.com',
  meetingLink: '',
  coverImageUrl: '',
}

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response
}

function meetRequestBody(): Record<string, unknown> {
  const call = vi
    .mocked(fetch)
    .mock.calls.find(([url]) => url === '/api/meetings/create-google-meet')
  const init = call?.[1] as RequestInit | undefined
  return JSON.parse(String(init?.body)) as Record<string, unknown>
}

describe('useManageMeeting invite payload', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url === '/api/meetings/create-feedback-form') {
          return jsonResponse({ feedbackFormUrl: 'https://forms.gle/week1' })
        }
        return jsonResponse({
          meetingLink: 'https://meet.google.com/abc-defg-hij',
        })
      }),
    )
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  async function run(payload: Omit<MeetingFormState, 'id'>) {
    const createMeeting = vi.fn().mockResolvedValue({ id: 'meeting-1' })
    const updateMeeting = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() =>
      useManageMeeting({ createMeeting, updateMeeting }),
    )
    const pending = result.current.createMeetingWithPipeline(payload)
    await vi.runAllTimersAsync()
    await pending
  }

  it('omits a blank group instead of inviting a default mailbox', async () => {
    await run({
      ...basePayload,
      description: '',
      googleGroupId: '   ',
    })

    expect(meetRequestBody()).toEqual({
      title: 'Weekly sync',
      date: basePayload.date,
    })
    expect(JSON.stringify(meetRequestBody())).not.toContain('mentorbridgeindia')
  })

  it('trims the Google Group id before sending the invite', async () => {
    await run({
      ...basePayload,
      googleGroupId: '  team@googlegroups.com  ',
    })

    expect(meetRequestBody()).toEqual({
      title: 'Weekly sync',
      date: basePayload.date,
      description: 'Agenda',
      googleGroupId: 'team@googlegroups.com',
      attendees: ['team@googlegroups.com'],
    })
  })

  it('uses a generic toast when meeting create fails with a non-Error', async () => {
    const createMeeting = vi.fn().mockRejectedValue('db down')
    const updateMeeting = vi.fn()
    const { result } = renderHook(() =>
      useManageMeeting({ createMeeting, updateMeeting }),
    )
    const pending = result.current.createMeetingWithPipeline(basePayload)
    const assertion = expect(pending).rejects.toBe('db down')
    await vi.runAllTimersAsync()
    await assertion

    expect(fetch).not.toHaveBeenCalled()
    expect(updateMeeting).not.toHaveBeenCalled()
    expect(gooeyToast.error).toHaveBeenCalledWith(
      'Failed to create meeting.',
      expect.objectContaining({ description: 'Please try again.' }),
    )
  })
})
