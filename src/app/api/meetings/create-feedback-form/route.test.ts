import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { createFormMock, fromMock } = vi.hoisted(() => ({
  createFormMock: vi.fn(),
  fromMock: vi.fn(),
}))

vi.mock('@/lib/googleForms', () => ({
  createMeetingFeedbackForm: (...args: unknown[]) => createFormMock(...args),
}))

vi.mock('@/lib/supabaseClient', () => ({
  get supabase() {
    return { from: fromMock }
  },
}))

import { NextRequest } from 'next/server'

import { POST } from './route'

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/meetings/create-feedback-form', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

function mockMeetingUpdate(error: { message: string } | null) {
  const eq = vi.fn().mockResolvedValue({ error })
  const update = vi.fn().mockReturnValue({ eq })
  fromMock.mockReturnValue({ update })
  return { update, eq }
}

describe('POST /api/meetings/create-feedback-form', () => {
  const originalRefreshToken = process.env.GOOGLE_REFRESH_TOKEN

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GOOGLE_REFRESH_TOKEN = 'refresh-token'
    createFormMock.mockResolvedValue('https://forms.gle/abc')
    mockMeetingUpdate(null)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    if (originalRefreshToken === undefined)
      delete process.env.GOOGLE_REFRESH_TOKEN
    else process.env.GOOGLE_REFRESH_TOKEN = originalRefreshToken
  })

  it('rejects invalid JSON and missing meeting fields', async () => {
    const invalidJson = await POST(makeRequest('{'))
    expect(invalidJson.status).toBe(400)
    await expect(invalidJson.json()).resolves.toEqual({ error: 'Invalid JSON body' })

    const missing = await POST(makeRequest({ meetingId: '  ', meetingTitle: '' }))
    expect(missing.status).toBe(400)
    await expect(missing.json()).resolves.toEqual({
      error: 'Missing or invalid required fields: meetingId, meetingTitle',
    })
    expect(createFormMock).not.toHaveBeenCalled()
  })

  it('returns 503 when Google Forms is not configured', async () => {
    process.env.GOOGLE_REFRESH_TOKEN = '  '

    const response = await POST(
      makeRequest({ meetingId: 'm1', meetingTitle: 'Standup' }),
    )

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      error: 'Google Forms API not configured',
    })
    expect(createFormMock).not.toHaveBeenCalled()
  })

  it('accepts numeric meeting ids, trims titles, and saves the form URL', async () => {
    const { update, eq } = mockMeetingUpdate(null)

    const response = await POST(
      makeRequest({ meetingId: 42, meetingTitle: '  Retro  ' }),
    )

    expect(createFormMock).toHaveBeenCalledWith('Retro')
    expect(update).toHaveBeenCalledWith({
      feedback_form: 'https://forms.gle/abc',
    })
    expect(eq).toHaveBeenCalledWith('id', '42')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      feedbackFormUrl: 'https://forms.gle/abc',
    })
  })

  it('maps a missing form URL and a failed meeting update to 502', async () => {
    createFormMock.mockResolvedValueOnce(null)
    const noForm = await POST(
      makeRequest({ meetingId: 'm1', meetingTitle: 'Standup' }),
    )
    expect(noForm.status).toBe(502)
    await expect(noForm.json()).resolves.toEqual({
      error: 'Failed to create feedback form',
    })

    createFormMock.mockResolvedValueOnce('https://forms.gle/abc')
    mockMeetingUpdate({ message: 'write failed' })
    const saveFailed = await POST(
      makeRequest({ meetingId: 'm1', meetingTitle: 'Standup' }),
    )
    expect(saveFailed.status).toBe(502)
    await expect(saveFailed.json()).resolves.toEqual({
      error: 'Form created but failed to save link. Form URL: https://forms.gle/abc',
    })
  })
})
