import { useCallback, useEffect, useRef, useState } from 'react'

import { sanitizeVisitorChatErrorMessage } from '@/lib/visitorChatClientError'
import { trimMessagesForVisitorChatApi, VISITOR_CHAT_MAX_MESSAGE_CHARS } from '@/lib/visitorChatLimits'
import type { VisitorChatMessage } from '@/lib/visitorChatStorage'
import {
  loadVisitorChatMessages,
  saveVisitorChatMessages,
  VISITOR_CHAT_WELCOME_MESSAGE,
} from '@/lib/visitorChatStorage'

export type { VisitorChatMessage }

export function useVisitorChat() {
  const [messages, setMessages] = useState<VisitorChatMessage[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inFlightRef = useRef(false)
  const messagesRef = useRef<VisitorChatMessage[]>([])
  messagesRef.current = messages

  useEffect(() => {
    const stored = loadVisitorChatMessages()
    if (stored && stored.length > 0) {
      messagesRef.current = stored
      setMessages(stored)
    } else {
      const initial = [VISITOR_CHAT_WELCOME_MESSAGE]
      messagesRef.current = initial
      setMessages(initial)
      saveVisitorChatMessages(initial)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveVisitorChatMessages(messages)
  }, [messages, hydrated])

  const sendUserMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || inFlightRef.current) return

    if (trimmed.length > VISITOR_CHAT_MAX_MESSAGE_CHARS) {
      setError(
        'Your message is too long. Shorten it or split it into smaller messages.',
      )
      return
    }

    inFlightRef.current = true
    setIsSending(true)
    setError(null)

    const beforeSend = messagesRef.current
    const withUser: VisitorChatMessage[] = [
      ...beforeSend,
      { role: 'user' as const, content: trimmed },
    ]
    messagesRef.current = withUser
    setMessages(withUser)

    const payload = trimMessagesForVisitorChatApi(withUser)

    try {
      const res = await fetch('/api/visitor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payload }),
      })
      const data = (await res.json()) as { reply?: string; error?: string }

      if (!res.ok) {
        setError(sanitizeVisitorChatErrorMessage(data.error))
        messagesRef.current = beforeSend
        setMessages(beforeSend)
        return
      }

      if (!data.reply) {
        setError(sanitizeVisitorChatErrorMessage(undefined))
        messagesRef.current = beforeSend
        setMessages(beforeSend)
        return
      }

      const withAssistant: VisitorChatMessage[] = [
        ...withUser,
        { role: 'assistant' as const, content: data.reply },
      ]
      messagesRef.current = withAssistant
      setMessages(withAssistant)
    } catch {
      setError(sanitizeVisitorChatErrorMessage(undefined))
      messagesRef.current = beforeSend
      setMessages(beforeSend)
    } finally {
      inFlightRef.current = false
      setIsSending(false)
    }
  }, [])

  return {
    messages,
    hydrated,
    isSending,
    error,
    sendUserMessage,
  }
}
