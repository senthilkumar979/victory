import { describe, expect, it } from 'vitest'

import {
  VISITOR_CHAT_MAX_MESSAGE_CHARS,
  VISITOR_CHAT_MAX_MESSAGES,
  clampMessageContents,
  trimMessagesForVisitorChatApi,
} from './visitorChatLimits'

function msg(role: 'user' | 'assistant', content: string) {
  return { role, content }
}

describe('trimMessagesForVisitorChatApi', () => {
  it('returns the original thread when it is within the message cap', () => {
    const messages = [msg('user', 'hi'), msg('assistant', 'hello')]

    expect(trimMessagesForVisitorChatApi(messages)).toBe(messages)
  })

  it('keeps the most recent turns and drops a leading assistant-only slice', () => {
    const messages = Array.from({ length: VISITOR_CHAT_MAX_MESSAGES + 3 }, (_, i) =>
      msg(i % 2 === 0 ? 'assistant' : 'user', `m${i}`),
    )

    const trimmed = trimMessagesForVisitorChatApi(messages)

    expect(trimmed).toHaveLength(VISITOR_CHAT_MAX_MESSAGES)
    expect(trimmed[0].role).toBe('user')
    expect(trimmed[0].content).toBe('m3')
    expect(trimmed.at(-1)?.content).toBe(`m${messages.length - 1}`)
  })

  it('drops every leading assistant turn after the window slice', () => {
    const messages = [
      msg('user', 'old'),
      ...Array.from({ length: VISITOR_CHAT_MAX_MESSAGES }, (_, i) =>
        msg('assistant', `a${i}`),
      ),
    ]

    expect(trimMessagesForVisitorChatApi(messages)).toEqual([])
  })
})

describe('clampMessageContents', () => {
  it('leaves short messages unchanged and truncates oversize contents', () => {
    const oversize = 'x'.repeat(VISITOR_CHAT_MAX_MESSAGE_CHARS + 25)
    const messages = [
      msg('user', 'short'),
      msg('assistant', oversize),
    ]

    const clamped = clampMessageContents(messages)

    expect(clamped[0]).toEqual(messages[0])
    expect(clamped[1].content).toHaveLength(VISITOR_CHAT_MAX_MESSAGE_CHARS)
    expect(clamped[1].role).toBe('assistant')
    expect(oversize.startsWith(clamped[1].content)).toBe(true)
  })
})
