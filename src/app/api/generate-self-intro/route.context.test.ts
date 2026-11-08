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
    body: JSON.stringify(body),
  })
}

function promptSent(): string {
  const prompt = generateContentMock.mock.calls[0]?.[0]
  if (typeof prompt !== 'string') throw new Error('Expected a prompt string')
  return prompt
}

describe('POST /api/generate-self-intro profile context', () => {
  const originalKey = process.env.GEMINI_API_KEY

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GEMINI_API_KEY = 'test-gemini-key'
    generateContentMock.mockResolvedValue({
      response: { text: () => 'I build software.' },
    })
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY
    else process.env.GEMINI_API_KEY = originalKey
  })

  it('sends at most five jobs and includes the optional profile fields', async () => {
    const experience = [0, 1, 2, 3, 4, 5].map((index) => ({
      role: `Role ${index}`,
      company: `Org ${index}`,
      summary: `Did ${index}`,
    }))

    const response = await POST(
      makeRequest({
        name: 'Ada',
        role: 'Engineer',
        summary: 'Writes compilers',
        batch: '2026',
        gender: 'female',
        inspirations: ['Books', 'Mentors'],
        skillSets: [],
        experience,
      }),
    )

    const prompt = promptSent()
    expect(prompt).toContain('Summary: Writes compilers')
    expect(prompt).toContain('Batch: 2026')
    expect(prompt).toContain('Gender: female')
    expect(prompt).toContain('Inspirations: Books, Mentors')
    expect(prompt).toContain('Role 0 at Org 0 - Did 0')
    expect(prompt).toContain('Role 4 at Org 4 - Did 4')
    expect(prompt).not.toContain('Role 5 at Org 5')
    expect(prompt).not.toContain('Company:')
    expect(prompt).not.toContain('Skills:')
    expect(response.status).toBe(200)
  })

  it('returns 502 when the model text is missing', async () => {
    generateContentMock.mockResolvedValueOnce({
      response: { text: () => undefined },
    })

    const response = await POST(makeRequest({ name: 'Ada', role: 'Engineer' }))

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({
      error: 'No content generated',
    })
  })

  it('replaces a thrown non-Error with a generic failure', async () => {
    generateContentMock.mockRejectedValueOnce('socket hang up')

    const response = await POST(makeRequest({ name: 'Ada', role: 'Engineer' }))

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to generate self-intro',
    })
  })
})
