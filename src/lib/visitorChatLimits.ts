/** Total messages per request (matches API). Long threads keep the most recent turns. */
export const VISITOR_CHAT_MAX_MESSAGES = 64

/** Per-message character cap (user + assistant); long model replies must fit. */
export const VISITOR_CHAT_MAX_MESSAGE_CHARS = 12000

interface RoleContent {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Keeps the tail of the thread so the request stays within limits. Drops leading
 * assistant-only turns after slicing so Gemini always receives valid history.
 */
export function trimMessagesForVisitorChatApi(
  messages: RoleContent[],
): RoleContent[] {
  if (messages.length <= VISITOR_CHAT_MAX_MESSAGES) return messages
  const slice = messages.slice(-VISITOR_CHAT_MAX_MESSAGES)
  let start = 0
  while (start < slice.length && slice[start].role === 'assistant') {
    start += 1
  }
  return slice.slice(start)
}

/** Ensures persisted threads stay within API limits after limit increases or legacy data. */
export function clampMessageContents<T extends RoleContent>(messages: T[]): T[] {
  return messages.map((m) =>
    m.content.length > VISITOR_CHAT_MAX_MESSAGE_CHARS
      ? {
          ...m,
          content: m.content.slice(0, VISITOR_CHAT_MAX_MESSAGE_CHARS),
        }
      : m,
  )
}
