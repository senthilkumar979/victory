import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  VISITOR_CHAT_MAX_MESSAGE_CHARS,
} from '@/lib/visitorChatLimits'
import {
  loadVisitorChatMessages,
  saveVisitorChatMessages,
  VISITOR_CHAT_STORAGE_KEY,
  type VisitorChatMessage,
} from '@/lib/visitorChatStorage'

describe('visitorChatStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('returns null for missing, empty, or non-array stored values', () => {
    expect(loadVisitorChatMessages()).toBeNull()

    localStorage.setItem(VISITOR_CHAT_STORAGE_KEY, '[]')
    expect(loadVisitorChatMessages()).toBeNull()

    localStorage.setItem(VISITOR_CHAT_STORAGE_KEY, '{"role":"user"}')
    expect(loadVisitorChatMessages()).toBeNull()

    localStorage.setItem(VISITOR_CHAT_STORAGE_KEY, '{')
    expect(loadVisitorChatMessages()).toBeNull()
  })

  it('keeps only valid role/content pairs and drops empty or unknown roles', () => {
    const stored = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: '' },
      { role: 'system', content: 'ignore' },
      { role: 'assistant', content: 'Hi there' },
      null,
      'nope',
    ]
    localStorage.setItem(VISITOR_CHAT_STORAGE_KEY, JSON.stringify(stored))

    expect(loadVisitorChatMessages()).toEqual([
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' },
    ])
  })

  it('returns null when every stored entry is invalid', () => {
    localStorage.setItem(
      VISITOR_CHAT_STORAGE_KEY,
      JSON.stringify([{ role: 'user', content: '' }, { role: 'bot', content: 'x' }]),
    )

    expect(loadVisitorChatMessages()).toBeNull()
  })

  it('clamps oversized persisted contents to the API character limit', () => {
    const long = 'x'.repeat(VISITOR_CHAT_MAX_MESSAGE_CHARS + 25)
    localStorage.setItem(
      VISITOR_CHAT_STORAGE_KEY,
      JSON.stringify([{ role: 'user', content: long }]),
    )

    const loaded = loadVisitorChatMessages()
    expect(loaded).toHaveLength(1)
    expect(loaded?.[0].content).toHaveLength(VISITOR_CHAT_MAX_MESSAGE_CHARS)
  })

  it('persists messages and swallows quota errors', () => {
    const messages: VisitorChatMessage[] = [
      { role: 'user', content: 'Ping' },
    ]
    saveVisitorChatMessages(messages)

    expect(localStorage.getItem(VISITOR_CHAT_STORAGE_KEY)).toBe(
      JSON.stringify(messages),
    )

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => saveVisitorChatMessages(messages)).not.toThrow()
  })
})
