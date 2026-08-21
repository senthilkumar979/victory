import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const generateContentMock = vi.hoisted(() => vi.fn())

vi.mock('server-only', () => ({}))

vi.mock('@google/generative-ai', () => {
  function GoogleGenerativeAI() {}
  GoogleGenerativeAI.prototype.getGenerativeModel = function getGenerativeModel() {
    return { generateContent: generateContentMock }
  }
  return { GoogleGenerativeAI }
})

import {
  buildCommentaryFromGenerated,
  generateLinkedInPostWithGemini,
} from './generateLinkedInPost'

describe('buildCommentaryFromGenerated', () => {
  it('joins title, description, normalized hashtags, and the primary link', () => {
    const commentary = buildCommentaryFromGenerated(
      {
        title: 'Cohort launch',
        description: 'Students shipped production work.',
        hashtags: ['MentorBridge', '#ITCareers'],
      },
      ' https://mentorbridge.in/awards ',
    )

    expect(commentary).toBe(
      [
        'Cohort launch',
        '',
        'Students shipped production work.',
        '',
        '#MentorBridge #ITCareers',
        '',
        'https://mentorbridge.in/awards',
      ].join('\n'),
    )
  })
})

describe('generateLinkedInPostWithGemini', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('GEMINI_API_KEY', 'test-key')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('throws when GEMINI_API_KEY is missing', async () => {
    vi.stubEnv('GEMINI_API_KEY', '')

    await expect(
      generateLinkedInPostWithGemini({
        title: 'Award',
        description: 'Top student',
        primaryLink: 'https://mentorbridge.in',
      }),
    ).rejects.toThrow('GEMINI_API_KEY is not configured')
    expect(generateContentMock).not.toHaveBeenCalled()
  })

  it('parses fenced JSON, strips hashtag prefixes, and ignores non-string tags', async () => {
    generateContentMock.mockResolvedValue({
      response: {
        text: () =>
          '```json\n{"title":"  Win  ","description":"  Great work.  ","hashtags":["#community", 1, "education", ""]}\n```',
      },
    })

    await expect(
      generateLinkedInPostWithGemini({
        title: 'Award night',
        description: 'Celebrating Ada',
        primaryLink: 'https://mentorbridge.in/awards',
        variant: 'award',
      }),
    ).resolves.toEqual({
      title: 'Win',
      description: 'Great work.',
      hashtags: ['community', 'education'],
    })

    expect(generateContentMock).toHaveBeenCalledWith(
      expect.stringContaining('celebrating student achievements'),
    )
  })

  it('rejects empty model output and missing title or description', async () => {
    generateContentMock.mockResolvedValueOnce({
      response: { text: () => '   ' },
    })

    await expect(
      generateLinkedInPostWithGemini({
        title: 'Award',
        description: 'Top student',
        primaryLink: 'https://mentorbridge.in',
      }),
    ).rejects.toThrow('No content generated')

    generateContentMock.mockResolvedValueOnce({
      response: {
        text: () => '{"title":"","description":"body","hashtags":[]}',
      },
    })

    await expect(
      generateLinkedInPostWithGemini({
        title: 'Award',
        description: 'Top student',
        primaryLink: 'https://mentorbridge.in',
      }),
    ).rejects.toThrow('Missing title or description in model output')
  })
})
