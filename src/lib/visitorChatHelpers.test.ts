import { describe, expect, it } from 'vitest'

import { parseAssistantVisitorMessage } from '@/lib/parseAssistantVisitorMessage'
import {
  sanitizeVisitorChatErrorMessage,
  VISITOR_CHAT_GENERIC_ERROR,
} from '@/lib/visitorChatClientError'
import { normalizeVisitorChatText } from '@/lib/visitorChatTextNormalize'

describe('sanitizeVisitorChatErrorMessage', () => {
  it('falls back to generic copy for empty or opaque errors', () => {
    expect(sanitizeVisitorChatErrorMessage(undefined)).toBe(
      VISITOR_CHAT_GENERIC_ERROR,
    )
    expect(sanitizeVisitorChatErrorMessage('   ')).toBe(VISITOR_CHAT_GENERIC_ERROR)
    expect(sanitizeVisitorChatErrorMessage('invalid JSON body')).toBe(
      VISITOR_CHAT_GENERIC_ERROR,
    )
    expect(sanitizeVisitorChatErrorMessage('Last message must be from the user')).toBe(
      VISITOR_CHAT_GENERIC_ERROR,
    )
    expect(sanitizeVisitorChatErrorMessage('Request failed')).toBe(
      VISITOR_CHAT_GENERIC_ERROR,
    )
  })

  it('does not expose SDK or model internals to visitors', () => {
    expect(
      sanitizeVisitorChatErrorMessage(
        '[GoogleGenerativeAI Error]: Candidate was blocked',
      ),
    ).toBe(VISITOR_CHAT_GENERIC_ERROR)
    expect(
      sanitizeVisitorChatErrorMessage('@google/generative-ai: quota exhausted'),
    ).toBe(VISITOR_CHAT_GENERIC_ERROR)
    expect(sanitizeVisitorChatErrorMessage('GenerativeModel timed out')).toBe(
      VISITOR_CHAT_GENERIC_ERROR,
    )
  })

  it('keeps visitor-safe server and validation copy', () => {
    expect(sanitizeVisitorChatErrorMessage('  Chat is temporarily unavailable.  ')).toBe(
      'Chat is temporarily unavailable.',
    )
    expect(sanitizeVisitorChatErrorMessage('Please enter a question.')).toBe(
      'Please enter a question.',
    )
  })
})

describe('normalizeVisitorChatText', () => {
  it('repairs common model typos in links, email, and markers', () => {
    const normalized = normalizeVisitorChatText(
      'Use ttps://mentorbridge.in or ttp://mentorbridge.in and ail@mentorbridge.in. [NAME]]Ada[[/NAME]] [SKILL]]React[[/SKILL]] [COMPANY]]Acme[[/COMPANY]]',
    )

    expect(normalized).toContain('https://mentorbridge.in')
    expect(normalized).toContain('http://mentorbridge.in')
    expect(normalized).toContain('mail@mentorbridge.in')
    expect(normalized).toContain('[[NAME]]Ada[[/NAME]]')
    expect(normalized).toContain('[[SKILL]]React[[/SKILL]]')
    expect(normalized).toContain('[[COMPANY]]Acme[[/COMPANY]]')
  })

  it('repairs truncated mentor bio labels without changing unrelated copy', () => {
    expect(
      normalizeVisitorChatText(
        'Role:oordinator. Technical Areas:is AI. Contribution:is mentoring. Background:is research. Coordinatort MentorBridge.',
      ),
    ).toBe(
      'Role: Coordinator. Technical Areas: His AI. Contribution: His mentoring. Background: His research. Coordinator at MentorBridge.',
    )
  })
})

describe('parseAssistantVisitorMessage', () => {
  it('returns no segments for blank assistant content', () => {
    expect(parseAssistantVisitorMessage('  \n  ')).toEqual([])
  })

  it('parses explicit contact and explore marker blocks', () => {
    expect(
      parseAssistantVisitorMessage(
        'Intro text.\n\n[[MB_CONTACT]]Email mail@mentorbridge.in for support.[[/MB_CONTACT]]\n\n[[MB_EXPLORE]]Explore the students section for placements.[[/MB_EXPLORE]]\n\nClosing text.',
      ),
    ).toEqual([
      { type: 'body', text: 'Intro text.' },
      { type: 'contact', text: 'Email mail@mentorbridge.in for support.' },
      { type: 'explore', text: 'Explore the students section for placements.' },
      { type: 'body', text: 'Closing text.' },
    ])
  })

  it('groups visitor-safe contact and explore hints without explicit markers', () => {
    expect(
      parseAssistantVisitorMessage(
        'MentorBridge helps students prepare for careers.\n\nFor more depth, contact mail@mentorbridge.in with your question.\n\nYou can browse the students section on this site for placement information.',
      ),
    ).toEqual([
      {
        type: 'body',
        text: 'MentorBridge helps students prepare for careers.',
      },
      {
        type: 'contact',
        text: 'For more depth, contact mail@mentorbridge.in with your question.',
      },
      {
        type: 'explore',
        text: 'You can browse the students section on this site for placement information.',
      },
    ])
  })

  it('merges adjacent body chunks so transcript rendering stays compact', () => {
    expect(parseAssistantVisitorMessage('First paragraph.\n\nSecond paragraph.')).toEqual([
      { type: 'body', text: 'First paragraph.\n\nSecond paragraph.' },
    ])
  })
})
