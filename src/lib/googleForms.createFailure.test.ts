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
  return { google: { auth: { OAuth2 } } }
})

import { createMeetingFeedbackForm } from './googleForms'

const envKeys = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REFRESH_TOKEN',
] as const

function mockCreatedForm() {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        formId: 'form-1',
        responderUri: 'https://forms.gle/abc',
      }),
    })
    .mockResolvedValueOnce({ ok: true, text: async () => '' })
    .mockResolvedValueOnce({ ok: true, text: async () => '' })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('createMeetingFeedbackForm create failures', () => {
  const previous: Record<string, string | undefined> = {}

  beforeEach(() => {
    setCredentialsMock.mockReset()
    getAccessTokenMock.mockReset()
    getAccessTokenMock.mockResolvedValue({ token: 'access-token' })
    vi.unstubAllGlobals()
    for (const key of envKeys) previous[key] = process.env[key]
    process.env.GOOGLE_CLIENT_ID = 'client-id'
    process.env.GOOGLE_CLIENT_SECRET = 'client-secret'
    process.env.GOOGLE_REFRESH_TOKEN = 'refresh-token'
  })

  afterEach(() => {
    for (const key of envKeys) {
      if (previous[key] === undefined) delete process.env[key]
      else process.env[key] = previous[key]
    }
    vi.unstubAllGlobals()
  })

  it('stops after a failed form create and keeps the API error', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => 'quota exceeded',
    })
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(createMeetingFeedbackForm('Weekly sync')).rejects.toThrow(
      'Failed to create form: quota exceeded',
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('does not batch-update when Google returns no form id', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ responderUri: 'https://forms.gle/orphan' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(createMeetingFeedbackForm('Weekly sync')).rejects.toThrow(
      'No formId in create response',
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('rejects a missing access token before calling the Forms API', async () => {
    getAccessTokenMock.mockResolvedValue({})
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(createMeetingFeedbackForm('Weekly sync')).rejects.toThrow(
      'Google Forms auth failed: Failed to obtain Google access token',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('wraps a non-Error auth failure without a Forms scope hint', async () => {
    getAccessTokenMock.mockRejectedValue('socket hang up')

    await expect(createMeetingFeedbackForm('Weekly sync')).rejects.toThrow(
      'Google Forms auth failed: socket hang up',
    )
  })

  it('reads credentials.access_token before token, then a bare access_token', async () => {
    getAccessTokenMock.mockResolvedValueOnce({
      credentials: { access_token: 'cred-token' },
      token: 'other-token',
    })
    const preferred = mockCreatedForm()
    await createMeetingFeedbackForm('Weekly sync')
    expect(preferred.mock.calls[0]?.[1]).toMatchObject({
      headers: { Authorization: 'Bearer cred-token' },
    })

    getAccessTokenMock.mockResolvedValueOnce({ access_token: 'direct-token' })
    const fallback = mockCreatedForm()
    await createMeetingFeedbackForm('Weekly sync')
    expect(fallback.mock.calls[0]?.[1]).toMatchObject({
      headers: { Authorization: 'Bearer direct-token' },
    })
  })
})
