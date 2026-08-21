import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const {
  sendMessageMock,
  startChatMock,
  getGenerativeModelMock,
  insertQueryMock,
  normalizeMock,
  liveContextMock,
} = vi.hoisted(() => ({
  sendMessageMock: vi.fn(),
  startChatMock: vi.fn(),
  getGenerativeModelMock: vi.fn(),
  insertQueryMock: vi.fn(),
  normalizeMock: vi.fn((text: string) => `normalized:${text}`),
  liveContextMock: vi.fn(),
}))

vi.mock('@google/generative-ai', () => {
  function GoogleGenerativeAI(_apiKey: string) {}
  GoogleGenerativeAI.prototype.getGenerativeModel = function getGenerativeModel(
    ...args: unknown[]
  ) {
    return getGenerativeModelMock(...args)
  }
  return { GoogleGenerativeAI }
})

vi.mock('@/data/mentorBridgeKnowledgeBase', () => ({
  getMentorBridgeKnowledgeBaseText: () => 'KB',
}))

vi.mock('@/lib/visitorChatDataContext', () => ({
  getCachedVisitorChatDataContext: liveContextMock,
}))

vi.mock('@/lib/visitorChatQueryLog', () => ({
  insertVisitorChatQuery: insertQueryMock,
}))

vi.mock('@/lib/visitorChatTextNormalize', () => ({
  normalizeVisitorChatText: (text: string) => normalizeMock(text),
}))

import { VISITOR_CHAT_GENERIC_ERROR } from '@/lib/visitorChatClientError'

import { POST } from './route'

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/visitor-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }) as never
}

describe('POST /api/visitor-chat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('GEMINI_API_KEY', 'test-key')
    liveContextMock.mockResolvedValue('LIVE DATA')
    insertQueryMock.mockResolvedValue(undefined)
    startChatMock.mockReturnValue({ sendMessage: sendMessageMock })
    getGenerativeModelMock.mockReturnValue({ startChat: startChatMock })
    sendMessageMock.mockResolvedValue({
      response: { text: () => '  Hello visitor  ' },
    })
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns 503 when GEMINI_API_KEY is not configured', async () => {
    vi.stubEnv('GEMINI_API_KEY', '')

    const response = await POST(makeRequest({ messages: [{ role: 'user', content: 'hi' }] }))

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      error: 'Chat is temporarily unavailable.',
    })
    expect(getGenerativeModelMock).not.toHaveBeenCalled()
  })

  it('returns a generic 400 for invalid JSON, empty threads, and non-user last turns', async () => {
    const invalidJson = await POST(makeRequest('{'))
    expect(invalidJson.status).toBe(400)
    await expect(invalidJson.json()).resolves.toEqual({
      error: VISITOR_CHAT_GENERIC_ERROR,
    })

    const empty = await POST(makeRequest({ messages: [] }))
    expect(empty.status).toBe(400)

    const lastAssistant = await POST(
      makeRequest({
        messages: [
          { role: 'user', content: 'hi' },
          { role: 'assistant', content: 'hello' },
        ],
      }),
    )
    expect(lastAssistant.status).toBe(400)
    expect(insertQueryMock).not.toHaveBeenCalled()
    expect(sendMessageMock).not.toHaveBeenCalled()
  })

  it('strips leading assistant history, logs the query, and returns a normalized reply', async () => {
    const response = await POST(
      makeRequest({
        messages: [
          { role: 'assistant', content: 'Welcome' },
          { role: 'user', content: 'Who are you?' },
          { role: 'assistant', content: 'MentorBridge' },
          { role: 'user', content: 'Tell me more' },
        ],
      }),
    )

    expect(insertQueryMock).toHaveBeenCalledWith({
      query: 'Tell me more',
      threadMessageCount: 4,
    })
    expect(startChatMock).toHaveBeenCalledWith({
      history: [
        { role: 'user', parts: [{ text: 'Who are you?' }] },
        { role: 'model', parts: [{ text: 'MentorBridge' }] },
      ],
    })
    expect(sendMessageMock).toHaveBeenCalledWith('Tell me more')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      reply: 'normalized:Hello visitor',
    })
  })

  it('returns 502 when the model reply is empty', async () => {
    sendMessageMock.mockResolvedValue({
      response: { text: () => '   ' },
    })

    const response = await POST(
      makeRequest({ messages: [{ role: 'user', content: 'hi' }] }),
    )

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({
      error: VISITOR_CHAT_GENERIC_ERROR,
    })
  })
})
