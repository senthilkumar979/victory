import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const {
  sendMessageMock,
  startChatMock,
  getGenerativeModelMock,
  liveContextMock,
} = vi.hoisted(() => ({
  sendMessageMock: vi.fn(),
  startChatMock: vi.fn(),
  getGenerativeModelMock: vi.fn(),
  liveContextMock: vi.fn(),
}))

vi.mock('@google/generative-ai', () => {
  function GoogleGenerativeAI() {}
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
  insertVisitorChatQuery: vi.fn(),
}))

vi.mock('@/lib/visitorChatTextNormalize', () => ({
  normalizeVisitorChatText: (text: string) => text,
}))

import { POST } from './route'

function makeRequest(content = 'Who are the students?') {
  return new Request('http://localhost/api/visitor-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content }] }),
  }) as never
}

function systemInstructionFromLastCall(): string {
  const [options] = getGenerativeModelMock.mock.calls.at(-1) as [
    { systemInstruction: string },
  ]
  return options.systemInstruction
}

describe('POST /api/visitor-chat live context fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('GEMINI_API_KEY', 'test-key')
    startChatMock.mockReturnValue({ sendMessage: sendMessageMock })
    getGenerativeModelMock.mockReturnValue({ startChat: startChatMock })
    sendMessageMock.mockResolvedValue({
      response: { text: () => 'Reply' },
    })
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses live snapshot text when the cached context loads', async () => {
    liveContextMock.mockResolvedValue('Ada | Engineer | Acme')

    const response = await POST(makeRequest())

    expect(response.status).toBe(200)
    expect(systemInstructionFromLastCall()).toContain(
      'LIVE SITE DATA (Supabase snapshot',
    )
    expect(systemInstructionFromLastCall()).toContain('Ada | Engineer | Acme')
    expect(systemInstructionFromLastCall()).not.toContain(
      'Snapshot temporarily unavailable',
    )
  })

  it('keeps chatting with fallback copy when live context is empty or throws', async () => {
    liveContextMock.mockResolvedValueOnce('   ')

    const empty = await POST(makeRequest())
    expect(empty.status).toBe(200)
    expect(systemInstructionFromLastCall()).toContain(
      'Snapshot temporarily unavailable—do not invent student names or skills',
    )
    expect(systemInstructionFromLastCall()).toContain(
      'https://www.mentorbridge.in/students',
    )

    liveContextMock.mockRejectedValueOnce(new Error('supabase timeout'))
    const failed = await POST(makeRequest())
    expect(failed.status).toBe(200)
    expect(systemInstructionFromLastCall()).toContain(
      'Snapshot temporarily unavailable',
    )
    expect(systemInstructionFromLastCall()).not.toContain('Ada | Engineer | Acme')
  })
})
