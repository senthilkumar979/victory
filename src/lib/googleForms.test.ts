import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { setCredentialsMock, getAccessTokenMock } = vi.hoisted(() => ({
  setCredentialsMock: vi.fn(),
  getAccessTokenMock: vi.fn(),
}))

vi.mock('googleapis', () => {
  function OAuth2(this: {
    setCredentials: typeof setCredentialsMock
    getAccessToken: typeof getAccessTokenMock
  }) {
    this.setCredentials = setCredentialsMock
    this.getAccessToken = getAccessTokenMock
  }
  return {
    google: {
      auth: { OAuth2 },
    },
  }
})

import { createMeetingFeedbackForm } from './googleForms'

const envKeys = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REFRESH_TOKEN',
] as const

describe('createMeetingFeedbackForm', () => {
  const previous: Record<string, string | undefined> = {}

  beforeEach(() => {
    setCredentialsMock.mockReset()
    getAccessTokenMock.mockReset()
    getAccessTokenMock.mockResolvedValue({ token: 'access-token' })
    vi.unstubAllGlobals()
    for (const key of envKeys) {
      previous[key] = process.env[key]
    }
    process.env.GOOGLE_CLIENT_ID = 'client-id'
    process.env.GOOGLE_CLIENT_SECRET = 'client-secret'
    process.env.GOOGLE_REFRESH_TOKEN = '  refresh-token  '
  })

  afterEach(() => {
    for (const key of envKeys) {
      if (previous[key] === undefined) delete process.env[key]
      else process.env[key] = previous[key]
    }
    vi.unstubAllGlobals()
  })

  it('throws when OAuth credentials are missing', async () => {
    delete process.env.GOOGLE_REFRESH_TOKEN
    await expect(createMeetingFeedbackForm('Weekly sync')).rejects.toThrow(
      /Missing Google OAuth credentials/,
    )
  })

  it('trims the refresh token and wraps invalid_grant with a Forms scope hint', async () => {
    getAccessTokenMock.mockRejectedValueOnce(new Error('invalid_grant'))

    await expect(createMeetingFeedbackForm('Weekly sync')).rejects.toThrow(
      /Google Forms auth failed:[\s\S]*forms\.body/,
    )
    expect(setCredentialsMock).toHaveBeenCalledWith({
      refresh_token: 'refresh-token',
    })
  })

  it('returns responderUri and still succeeds when updateFormInfo fails', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          formId: 'form-1',
          responderUri: 'https://forms.gle/abc',
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'bad meta',
      })
      .mockResolvedValueOnce({ ok: true, text: async () => '' })
    vi.stubGlobal('fetch', fetchMock)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await expect(createMeetingFeedbackForm('Weekly sync')).resolves.toBe(
      'https://forms.gle/abc',
    )

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      'https://forms.googleapis.com/v1/forms',
    )
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      'https://forms.googleapis.com/v1/forms/form-1:batchUpdate',
    )
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('falls back to the viewform URL when responderUri is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ formId: 'form-9' }),
        })
        .mockResolvedValueOnce({ ok: true, text: async () => '' })
        .mockResolvedValueOnce({ ok: true, text: async () => '' }),
    )

    await expect(createMeetingFeedbackForm('Retro')).resolves.toBe(
      'https://docs.google.com/forms/d/form-9/viewform',
    )
  })

  it('throws when the questions batchUpdate fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ formId: 'form-1' }),
        })
        .mockResolvedValueOnce({ ok: true, text: async () => '' })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: async () => 'items failed',
        }),
    )
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(createMeetingFeedbackForm('Weekly sync')).rejects.toThrow(
      'Failed to add questions: items failed',
    )
    error.mockRestore()
  })
})
