import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { getAccessTokenMock } = vi.hoisted(() => ({
  getAccessTokenMock: vi.fn(),
}))

vi.mock('googleapis', () => {
  function OAuth2(this: {
    setCredentials: () => void
    getAccessToken: typeof getAccessTokenMock
  }) {
    this.setCredentials = () => {}
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

const questionTitles = [
  'Rate the meeting (1-10)',
  'How well did you understand?',
  'How well was the presenter equipped with the topic?',
  'Things that you liked',
  'How to make the meeting even better',
]

describe('createMeetingFeedbackForm question contract', () => {
  const previous: Record<string, string | undefined> = {}

  beforeEach(() => {
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

  it('sends one required 1-10 scale question and four required paragraphs', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ formId: 'form-1', responderUri: 'https://forms.gle/abc' }),
      })
      .mockResolvedValueOnce({ ok: true, text: async () => '' })
      .mockResolvedValueOnce({ ok: true, text: async () => '' })
    vi.stubGlobal('fetch', fetchMock)

    await createMeetingFeedbackForm('Weekly sync')

    const createBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))
    const metaBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))
    const questions = JSON.parse(String(fetchMock.mock.calls[2]?.[1]?.body))

    expect(createBody).toEqual({ info: { title: 'Feedback: Weekly sync' } })
    expect(metaBody.requests[0].updateFormInfo.updateMask).toBe(
      'documentTitle,description',
    )
    expect(metaBody.requests[0].updateFormInfo.info.description).toContain(
      'Weekly sync',
    )

    const items = questions.requests.map(
      (request: { createItem: { item: { title: string; questionItem: { question: object } }; location: { index: number } } }) =>
        request.createItem,
    )
    expect(items.map((item: { location: { index: number } }) => item.location.index)).toEqual([
      0, 1, 2, 3, 4,
    ])
    expect(items.map((item: { item: { title: string } }) => item.item.title)).toEqual(
      questionTitles,
    )
    expect(items[0].item.questionItem.question).toEqual({
      required: true,
      scaleQuestion: { low: 1, high: 10 },
    })
    for (const item of items.slice(1)) {
      expect(item.item.questionItem.question).toEqual({
        required: true,
        textQuestion: { paragraph: true },
      })
    }
  })
})
