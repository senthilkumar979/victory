import { clampMessageContents } from '@/lib/visitorChatLimits'

export interface VisitorChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export const VISITOR_CHAT_STORAGE_KEY = 'mentorbridge-visitor-chat-v1'

export const VISITOR_CHAT_WELCOME_MESSAGE: VisitorChatMessage = {
  role: 'assistant',
  content:
    'Welcome! Ask me anything about MentorBridge—our mission, mentors and students, programs, placements, or how to find your way around the site. How can I help you today?',
}

function isValidMessage(x: unknown): x is VisitorChatMessage {
  if (!x || typeof x !== 'object') return false
  const m = x as Record<string, unknown>
  return (
    (m.role === 'user' || m.role === 'assistant') &&
    typeof m.content === 'string' &&
    m.content.length > 0
  )
}

export function loadVisitorChatMessages(): VisitorChatMessage[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(VISITOR_CHAT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    const messages = parsed.filter(isValidMessage)
    if (messages.length === 0) return null
    return clampMessageContents(messages)
  } catch {
    return null
  }
}

export function saveVisitorChatMessages(messages: VisitorChatMessage[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(VISITOR_CHAT_STORAGE_KEY, JSON.stringify(messages))
  } catch {
    // Quota or private mode — ignore
  }
}
