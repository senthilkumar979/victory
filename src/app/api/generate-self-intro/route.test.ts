import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { generateContentMock } = vi.hoisted(() => ({
  generateContentMock: vi.fn(),
}))

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return { generateContent: generateContentMock }
    }
  },
}))

import { NextRequest } from 'next/server'

import { POST } from './route'

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/generate-self-intro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

describe('POST /api/generate-self-intro', () => {
  const originalKey = process.env.GEMINI_API_KEY

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GEMINI_API_KEY = 'test-gemini-key'
    generateContentMock.mockResolvedValue({
      response: { text: () => '  I am Ada, an engineer.  ' },
    })
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY
    else process.env.GEMINI_API_KEY = originalKey
  })

  it('returns 500 when Gemini is not configured', async () => {
    process.env.GEMINI_API_KEY = '  '

    const response = await POST(
      makeRequest({ name: 'Ada', role: 'Engineer' }),
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Gemini API is not configured',
    })
    expect(generateContentMock).not.toHaveBeenCalled()
  })

  it('rejects invalid JSON and profiles without a name', async () => {
    const invalidJson = await POST(makeRequest('{'))
    expect(invalidJson.status).toBe(400)
    await expect(invalidJson.json()).resolves.toEqual({ error: 'Invalid JSON body' })

    const missingName = await POST(makeRequest({ role: 'Engineer' }))
    expect(missingName.status).toBe(400)
    await expect(missingName.json()).resolves.toEqual({
      error: 'Profile data with name is required',
    })
    expect(generateContentMock).not.toHaveBeenCalled()
  })

  it('sends a compact profile context and returns the trimmed intro', async () => {
    const response = await POST(
      makeRequest({
        name: 'Ada',
        role: 'Engineer',
        company: 'Acme',
        skillSets: ['React', 'Node'],
        experience: [
          { role: 'Dev', company: 'Acme', summary: 'Built compilers' },
        ],
        mentorBridgeExp: {
          role: 'Mentee',
          company: 'MentorBridge',
          summary: 'Learned',
        },
      }),
    )

    const prompt = generateContentMock.mock.calls[0]?.[0] as string
    expect(prompt).toContain('Name: Ada')
    expect(prompt).toContain('Role: Engineer')
    expect(prompt).toContain('Company: Acme')
    expect(prompt).toContain('Skills: React, Node')
    expect(prompt).toContain('Dev at Acme - Built compilers')
    expect(prompt).toContain('MentorBridge Experience: Mentee at MentorBridge - Learned')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      selfIntro: 'I am Ada, an engineer.',
    })
  })

  it('maps empty model output to 502 and thrown errors to 500', async () => {
    generateContentMock.mockResolvedValueOnce({
      response: { text: () => '   ' },
    })
    const empty = await POST(makeRequest({ name: 'Ada', role: 'Engineer' }))
    expect(empty.status).toBe(502)
    await expect(empty.json()).resolves.toEqual({ error: 'No content generated' })

    generateContentMock.mockRejectedValueOnce(new Error('quota exceeded'))
    const failed = await POST(makeRequest({ name: 'Ada', role: 'Engineer' }))
    expect(failed.status).toBe(500)
    await expect(failed.json()).resolves.toEqual({ error: 'quota exceeded' })
  })
})
