import { describe, expect, it } from 'vitest'

import {
  sanitizeVisitorChatErrorMessage,
  VISITOR_CHAT_GENERIC_ERROR,
} from './visitorChatClientError'

describe('sanitizeVisitorChatErrorMessage', () => {
  it('replaces missing, SDK, and opaque API errors with generic copy', () => {
    expect(sanitizeVisitorChatErrorMessage(undefined)).toBe(VISITOR_CHAT_GENERIC_ERROR)
    expect(sanitizeVisitorChatErrorMessage('')).toBe(VISITOR_CHAT_GENERIC_ERROR)
    expect(
      sanitizeVisitorChatErrorMessage('[GoogleGenerativeAI Error]: quota'),
    ).toBe(VISITOR_CHAT_GENERIC_ERROR)
    expect(sanitizeVisitorChatErrorMessage('invalid json body')).toBe(
      VISITOR_CHAT_GENERIC_ERROR,
    )
    expect(sanitizeVisitorChatErrorMessage('Request failed')).toBe(
      VISITOR_CHAT_GENERIC_ERROR,
    )
  })

  it('passes through visitor-safe outage copy and other non-internal messages', () => {
    expect(
      sanitizeVisitorChatErrorMessage(
        'Chat is temporarily unavailable. Please try again shortly.',
      ),
    ).toBe('Chat is temporarily unavailable. Please try again shortly.')
    expect(sanitizeVisitorChatErrorMessage('  Rate limited. Try later.  ')).toBe(
      'Rate limited. Try later.',
    )
  })
})
